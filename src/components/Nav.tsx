"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard \u4eea\u8868\u76d8", icon: LayoutDashboard },
  { href: "/pages", label: "Pages \u9875\u9762", icon: BookOpen },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1100px] items-center gap-0 px-4 sm:px-6">
        <Link
          href="/"
          className="mr-6 flex items-center gap-2 py-3 text-sm font-semibold text-accent"
        >
          <BookOpen size={18} />
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
                "flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-text-dim hover:text-accent"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
