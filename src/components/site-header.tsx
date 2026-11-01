"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ArrowRightIcon from "@/components/arrow-right-icon";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#team", label: "The team" },
  { href: "/#mark-6", label: "Cars" },
  { href: "/merchandise", label: "Merchandise" },
  { href: "/#track-record", label: "Track record" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 12);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <Link
        className="brand"
        href="/"
        aria-label="Anargya ITS — home"
        onClick={() => setMenuOpen(false)}
      >
        <Image
          src="/images/anargya-wordmark.webp"
          alt=""
          width={288}
          height={37}
        />
      </Link>

      <button
        className={`menu-toggle${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav
        className={`main-nav${menuOpen ? " is-open" : ""}`}
        id="site-navigation"
        aria-label="Main navigation"
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link
          className="nav-cta"
          href="/journey/giias-2027"
          onClick={() => setMenuOpen(false)}
        >
          <span>Explore GIIAS</span>
          <span className="nav-cta-icon"><ArrowRightIcon /></span>
        </Link>
      </nav>
    </header>
  );
}
