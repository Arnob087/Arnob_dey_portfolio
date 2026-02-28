"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

interface NavbarProps {
  name: string;
  profileImageUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({ name, profileImageUrl }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    return () => {
      setMenuOpen(false);
    };
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#E4F5F5]/90 backdrop-blur-lg shadow-sm border-b border-slate-100"
          : "bg-[#E4F5F5]/40 backdrop-blur-md shadow-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Profile Image + Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          {/* Profile Photo */}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-200 group-hover:border-indigo-400 transition-colors shrink-0">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={name || "Profile"}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                <User size={18} className="text-indigo-500" />
              </div>
            )}
          </div>

          {/* Name */}
          <span className="font-serif text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {name || "Portfolio"}
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-600"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/45 border-t border-slate-100 px-4 py-4 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-slate-600 py-3 px-2 rounded-lg hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;