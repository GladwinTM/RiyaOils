"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

export function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className="min-h-11 text-lg font-medium"
        >
          {link.label}
        </Link>
      ))}
      <Link href="/account" onClick={onNavigate} className="min-h-11 text-lg font-medium">
        Account
      </Link>
      <Link href="/track-order" onClick={onNavigate} className="min-h-11 text-lg font-medium">
        Track order
      </Link>
    </div>
  );
}
