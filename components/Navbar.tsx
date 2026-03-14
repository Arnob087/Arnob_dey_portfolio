"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, Github, Linkedin, Facebook, Instagram } from "lucide-react";
import { Socials } from "@/types";

interface NavbarProps {
  name: string;
  profileImageUrl?: string;
  socials?: Socials;
}

const Navbar: React.FC<NavbarProps> = ({ name, profileImageUrl, socials }) => {
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
        <div className="hidden md:flex items-center gap-6">
          {/* Main Pages */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-bold transition-colors ${
                pathname === "/" ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={`text-sm font-bold transition-colors ${
                pathname === "/projects" ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              Projects & Blogs
            </Link>
          </div>

          {/* Divider */}
          <div className="h-4 w-[1px] bg-slate-200 mx-2" />

          {/* Quick Shortcuts (In-Page) */}
          <div className="flex items-center gap-5">
            <Link
              href="/#experience"
              className="group flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
              Experience
            </Link>
            <Link
              href="/#skills"
              className="group flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
              Stacks
            </Link>
            <Link
              href="/#education"
              className="group flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
              Education
            </Link>
          </div>

          {/* New Social Icons */}
          <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            {socials?.github && (
              <a href={socials.github} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-600 transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
            )}
            {socials?.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-600 transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            )}
            {socials?.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-indigo-600 transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            )}
          </div>
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-6 space-y-6 animate-in slide-in-from-top-2 shadow-2xl">
          {/* Main Pages */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Pages</p>
            <Link
              href="/"
              className={`block text-lg font-bold py-2 px-3 rounded-xl transition-colors ${
                pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Home
            </Link>
            <Link
              href="/projects"
              className={`block text-lg font-bold py-2 px-3 rounded-xl transition-colors ${
                pathname === "/projects" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Projects
            </Link>
          </div>

          {/* Shortcuts */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Go to Section</p>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/#experience"
                className="flex items-center gap-3 text-sm font-bold text-slate-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                Experience
              </Link>
              <Link
                href="/#skills"
                className="flex items-center gap-3 text-sm font-bold text-slate-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Technical Stacks
              </Link>
              <Link
                href="/#education"
                className="flex items-center gap-3 text-sm font-bold text-slate-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Education
              </Link>
              <Link
                href="/#contact"
                className="flex items-center gap-3 text-sm font-bold text-slate-600 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                Get in Touch
              </Link>
            </div>
          </div>
          
          {/* Mobile Social Icons */}
          <div className="flex items-center gap-6 px-4 py-6 border-t border-slate-100 bg-slate-50/50 -mx-6 rounded-b-2xl">
            {socials?.github && (
              <a href={socials.github} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600" aria-label="GitHub">
                <Github size={20} />
              </a>
            )}
            {socials?.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            )}
            {socials?.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;