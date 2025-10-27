"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/servers", label: "Serveurs" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-6xl px-4">
      {/* barre iOS-26 glass */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,.35)] px-3">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="px-2 text-white font-semibold tracking-wide">
            未来VPN
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-4 h-9 rounded-full inline-flex items-center justify-center text-sm transition-colors",
                    active
                      ? "bg-white text-black"
                      : "text-neutral-200 hover:bg-white/10"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions droites */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://discord.gg/xYas5XFmMD"
              target="_blank"
              rel="noreferrer"
              className="px-4 h-9 rounded-full inline-flex items-center justify-center text-sm bg-white/10 text-white hover:bg-white/15"
            >
              Support Discord
            </a>
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden px-3 h-9 rounded-full inline-flex items-center justify-center text-white/90 hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>

        {/* Menu mobile (glass inside) */}
        {open && (
          <div className="md:hidden border-t border-white/10 pt-2 pb-3">
            <nav className="flex flex-col gap-1">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      "h-10 px-3 rounded-xl inline-flex items-center",
                      active ? "bg-white text-black" : "text-neutral-200 hover:bg-white/10"
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <a
                href="https://discord.gg/xYas5XFmMD"
                target="_blank"
                rel="noreferrer"
                className="h-10 px-3 rounded-xl inline-flex items-center text-neutral-200 hover:bg-white/10"
              >
                Support Discord
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
