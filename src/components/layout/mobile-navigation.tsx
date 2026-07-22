"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNavigation } from "@/lib/navigation";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function closeNavigation() {
    setIsOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Navigation schließen" : "Navigation öffnen"}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white/5 text-content transition hover:bg-white/10"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-line bg-page/95 px-4 py-5 shadow-2xl backdrop-blur-xl"
        >
          <nav aria-label="Mobile Hauptnavigation">
            <ul className="space-y-1">
              {mainNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeNavigation}
                      className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-accent-soft text-accent-light"
                          : "text-muted hover:bg-white/5 hover:text-content"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/portal"
              onClick={closeNavigation}
              className="mt-5 flex w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
            >
              Mitgliederportal
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}