"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  ["/projects", "Projects"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header wrap">
      <Link
        href="/"
        className="wordmark"
        aria-label="Form Frequency home"
        onClick={() => setOpen(false)}
      >
        F<span className="mark-slash">/</span>F
        <span className="mark-dot">•</span>
      </Link>
      <nav aria-label="Main navigation" className={open ? "nav open" : "nav"}>
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </nav>
      <button
        className="icon-button menu-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer wrap">
      <Link href="/contact" className="footer-invite">
        Have something
        <br />
        in mind? <ArrowUpRight />
      </Link>
      <div className="footer-bottom">
        <Link href="/" className="footer-brand">
          FORM / FREQUENCY
        </Link>
        <span>Independent minds. Shared energy.</span>
        <Link href="/studio">Studio editor</Link>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
