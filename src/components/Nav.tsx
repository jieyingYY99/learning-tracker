"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Search } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/pages", label: "Pages", icon: BookOpen },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-0 px-6 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="mr-8 flex items-center gap-2 py-3.5 text-sm font-bold text-accent"
        >
          <BookOpen size={20} />
          <span className="hidden sm:inline">Learning Tracker</span>
        </Link>
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-1.5 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors",
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-text-dim hover:text-accent"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
