import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE_NAME = "historische-schiene-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  userId: number;
  expiresAt: number;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  displayName: string;
  roleKeys: string[];
};

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET fehlt oder ist zu kurz. Hinterlege mindestens 32 zufällige Zeichen in der .env.",
    );
  }

  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function encodeSession(payload: SessionPayload): string {
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function decodeSession(value: string): SessionPayload | null {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      !Number.isInteger(payload.userId) ||
      !Number.isInteger(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  try {
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedBuffer = Buffer.from(hash, "hex");

    return (
      storedBuffer.length === derivedKey.length &&
      timingSafeEqual(storedBuffer, derivedKey)
    );
  } catch {
    return false;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      roles: {
        include: {
          role: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roleKeys: user.roles.map(({ role }) => role.key),
  };
}

export async function createSession(userId: number): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encodeSession({ userId, expiresAt }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  const session = decodeSession(sessionCookie);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      roles: {
        include: {
          role: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roleKeys: user.roles.map(({ role }) => role.key),
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}