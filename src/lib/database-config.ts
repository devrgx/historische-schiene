export type MariaDbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
};

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Die notwendige Umgebungsvariable "${name}" wurde nicht gesetzt.`,
    );
  }

  return value;
}

function getDatabasePort(): number {
  const rawPort = process.env.DATABASE_PORT ?? "3306";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(
      `DATABASE_PORT enthält keinen gültigen Port: "${rawPort}".`,
    );
  }

  return port;
}

export function getMariaDbConfig(): MariaDbConfig {
  return {
    host: getRequiredEnvironmentVariable("DATABASE_HOST"),
    port: getDatabasePort(),
    user: getRequiredEnvironmentVariable("DATABASE_USER"),
    password: getRequiredEnvironmentVariable("DATABASE_PASSWORD"),
    database: getRequiredEnvironmentVariable("DATABASE_NAME"),
    connectionLimit: 5,
  };
}