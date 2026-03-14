"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  ExternalLink,
  Award,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Globe,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PortfolioData, ContactDetail } from "@/types";
import { apiClient } from "@/services/apiClient";
import RichContent from "./RichContent";

interface HomeProps {
  data: PortfolioData;
}

const HomeComponent: React.FC<HomeProps> = ({ data }) => {
  const router = useRouter();

  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    setErrorMessage("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setFormStatus("error");
      setErrorMessage("All fields are required.");
      setTimeout(() => setFormStatus("idle"), 3000);
      return;
    }

    const result = await apiClient.sendEmail(formData);

    if (result.success) {
      setFormStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 3000);
    } else {
      setFormStatus("error");
      setErrorMessage(result.error || "Failed to send message.");
      setTimeout(() => setFormStatus("idle"), 3000);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
  };

  const getContactIcon = (icon: ContactDetail["icon"]) => {
    switch (icon) {
      case "mail":
        return <Mail size={20} />;
      case "phone":
        return <Phone size={20} />;
      case "map-pin":
        return <MapPin size={20} />;
      default:
        return <Mail size={20} />;
    }
  };

  const experiences = data.experiences || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const contactDetails = data.contactDetails || [];
  const projects = data.projects || [];

  // -------- Carousel (single highlighted project, autoplay) ----------
  const visibleProjects = projects; // can slice if desired
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  // advance function
  const advance = () => {
    if (visibleProjects.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % visibleProjects.length);
  };

  useEffect(() => {
    const intervalMs = 3000;
    if (visibleProjects.length === 0) return;
    let id: number | undefined;
    if (!isHoveringCarousel) {
      id = window.setInterval(() => {
        advance();
      }, intervalMs);
    }
    return () => {
      if (id) window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoveringCarousel, visibleProjects.length]);

  // pause autoplay on pointer enter, resume on leave
  const handleMouseEnter = () => setIsHoveringCarousel(true);
  const handleMouseLeave = () => setIsHoveringCarousel(false);

  // click handler: navigate to project page
  const handleCardClick = () => {
    router.push("/projects");
  };

  // next / prev controls
  const next = () => {
    if (visibleProjects.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % visibleProjects.length);
  };
  const prev = () => {
    if (visibleProjects.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + visibleProjects.length) % visibleProjects.length);
  };

  return (
    <div className="space-y-20 md:space-y-32 mb-20 overflow-hidden">
      {/* ── Hero ──────────────────────────────────── */}
      <section className="min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center max-w-7xl mx-auto px-4 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-4">
            Hello, I&apos;m {data.name}
          </h2>
          <h1 className="font-serif text-4xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
            {data.tagline}
          </h1>
          <div className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl">
            <RichContent html={data.heroSubtitle || ""} />
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/20"
            >
              Get in touch
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            {data.resumeUrl ? (
              <a
                href={data.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-medium border border-slate-200 bg-white/50 backdrop-blur hover:bg-white transition-all flex items-center justify-center gap-2 group"
              >
                <FileText size={20} className="text-indigo-600" />
                View Resume
                <Download
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600"
                />
              </a>
            ) : (
              <button
                onClick={() => scrollTo("skills")}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-medium border border-slate-200 bg-white/50 backdrop-blur hover:bg-white transition-all"
              >
                View my work
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Experience ────────────────────────────── */}
      {experiences.length > 0 && (
        <section id="experience" className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="md:w-1/3">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6">
                Experience
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                A journey through diverse challenges and professional growth.
              </p>
            </div>

            <div className="md:w-2/3 space-y-8 md:space-y-12">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="relative pl-6 md:pl-8 border-l-2 border-indigo-100 hover:border-indigo-600 transition-colors group"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600" />
                  <span className="text-xs md:text-sm font-semibold text-indigo-600 mb-1.5 md:mb-2 block">
                    {exp.duration}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 break-words">
                    {exp.role}
                  </h3>
                  <p className="text-slate-500 font-medium mb-3 md:mb-4 text-sm md:text-base break-words">
                    {exp.company}
                  </p>
                  <div className="min-w-0 overflow-hidden">
                    <RichContent
                      html={exp.description}
                      className="text-slate-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About Me ──────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-4">
        <div className="bg-white/50 backdrop-blur rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-center relative z-10">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <User size={14} /> My Story
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-6 md:mb-8">
                Passion for Technology, Commitment to Excellence
              </h2>
              <div className="space-y-6 text-slate-600 text-balance md:text-lg leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
                <RichContent html={data.about} />
              </div>
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2 w-full max-w-sm lg:max-w-none mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600/5 rounded-[2.5rem] rotate-3 translate-x-4 translate-y-4" />
                {data.profileImageUrl ? (
                  <Image
                    src={data.profileImageUrl}
                    alt={data.name}
                    width={600}
                    height={750}
                    className="rounded-[2.5rem] shadow-2xl relative z-10 w-full object-cover aspect-[4/5]"
                    priority
                  />
                ) : (
                  <div className="rounded-[2.5rem] shadow-2xl relative z-10 w-full aspect-[4/5] bg-slate-200 flex items-center justify-center">
                    <User size={80} className="text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects Highlight Carousel (single center highlight, smoother) ───────────────── */}
      {visibleProjects.length > 0 && (
        <section
          id="projects-carousel"
          className="max-w-7xl mx-auto px-4 py-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900">
                Project Highlights
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                A curated glimpse of selected projects — highlighted one at a
                time.
              </p>
            </div>
          </div>

          {/* Enhanced Dots Navigation */}
          {/* Container — NO overflow:hidden, use overflow:visible so side cards show */}

          <div
            className="relative w-full h-[520px] flex items-center justify-center"
            role="list"
            aria-label="Project highlights"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {visibleProjects.map((p, i) => {
              const N = visibleProjects.length;
              let diff = (i - activeIndex + N) % N;
              if (diff > Math.floor(N / 2)) diff -= N;

              // Circular positions: -1 = left, 0 = active, 1 = right, rest = hidden
              const isActive = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;
              const isHidden = Math.abs(diff) > 1;

              return (
                <article
                  key={p.id}
                  role="listitem"
                  tabIndex={isHidden ? -1 : 0}
                  onClick={() => {
                    if (isLeft) setActiveIndex((activeIndex - 1 + N) % N);
                    if (isRight) setActiveIndex((activeIndex + 1) % N);
                    if (isActive) handleCardClick();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isLeft) setActiveIndex((activeIndex - 1 + N) % N);
                      if (isRight) setActiveIndex((activeIndex + 1) % N);
                      if (isActive) handleCardClick();
                    }
                  }}
                  style={{
                    transform: isActive
                      ? "translateX(0px) scale(1)"
                      : isLeft
                        ? "translateX(-360px) scale(0.82)"   // was -260px
                        : isRight
                          ? "translateX(360px) scale(0.82)"    // was 260px
                          : `translateX(${diff < 0 ? -440 : 440}px) scale(0.65)`,  // was ±320px
                    opacity: isActive ? 1 : isLeft || isRight ? 0.7 : 0,
                    zIndex: isActive ? 30 : isLeft || isRight ? 20 : 5,
                    pointerEvents: isHidden ? "none" : "auto",
                    filter: isHidden ? "blur(4px)" : "none",
                  }}
                  className="absolute w-[350px] h-[480px] p-10 rounded-[10px] overflow-hidden cursor-pointer
                   border border shadow-lg border-slate-200 transition-all duration-[200ms] ease-[cubic-bezier(.4,0,.2,1)]
                   select-none group"
                >
                  {/* Full-bleed image */}
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                      <svg width="40" height="30" viewBox="0 0 24 16" fill="none">
                        <rect width="24" height="16" rx="2" fill="#E2E8F0" />
                        <circle cx="6" cy="7" r="1.8" fill="#94A3B8" />
                        <path d="M3 12l3.2-3.6 2.4 3 2.4-2.8L21 13" stroke="#64748B" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-[15px] font-bold text-white mb-1 line-clamp-2 leading-tight">
                      {p.title}
                    </h3>
                    <div className="text-[5px] text-white/72 line-clamp-2 h-[100px] leading-relaxed mb-2.5 overflow-y-auto-hidden">
                      <RichContent html={p.description || ""} />
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors uppercase tracking-wider">
                      See Project <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Education ─────────────────────────────── */}
      {education.length > 0 && (
        <section id="education" className="bg-white/40 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              <div className="md:w-1/3">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Education
                </h2>
                <p className="text-slate-500">
                  My academic path and notable achievements.
                </p>
              </div>
              <div className="md:w-2/3 space-y-6 md:space-y-8">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-6 md:p-10 rounded-[2rem] bg-blue-50/50 border border-blue-100 hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          {edu.year}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-3">
                          {edu.degree}
                        </h3>
                        <p className="text-slate-500 text-base md:text-lg">
                          {edu.school}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform hidden sm:block">
                        <Award className="text-indigo-600" size={32} />
                      </div>
                    </div>
                    {edu.achievements?.filter(Boolean).length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Key Achievements
                        </p>
                        {edu.achievements.filter(Boolean).map((ach, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 text-slate-600 text-sm md:text-base"
                          >
                            <CheckCircle2
                              size={16}
                              className="text-green-500 mt-1 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <RichContent html={ach} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Technical Stacks ──────────────────────── */}
      {skills.length > 0 && (
        <section id="skills" className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Technical Stacks
            </h2>
            <p className="text-slate-500">
              The tools and languages I&apos;ve mastered.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {skills.map((skill) => (
              <a
                key={skill.id}
                href={skill.docUrl || "#"}
                target={skill.docUrl ? "_blank" : undefined}
                rel="noreferrer"
                className="px-6 md:px-8 py-4 md:py-5 rounded-2xl bg-white/60 border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 hover:border-indigo-200 transition-all group"
              >
                <div
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${skill.icon || "bg-indigo-500"} group-hover:scale-125 transition-transform`}
                />
                <span className="font-bold text-base md:text-lg text-slate-700 group-hover:text-indigo-600 transition-colors">
                  {skill.name}
                </span>
                <ExternalLink
                  size={12}
                  className="text-slate-300 group-hover:text-indigo-400"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Contact ───────────────────────────────── */}
      <section id="contact" className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/3 bg-indigo-600 p-8 md:p-12 text-white">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">
              Get in Touch
            </h2>
            <div className="space-y-6 md:space-y-8">
              {contactDetails.map((detail) => (
                <div key={detail.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {getContactIcon(detail.icon)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-indigo-100 text-xs">{detail.label}</p>
                    <span className="font-medium text-sm md:text-base">
                      {detail.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 bg-white/95 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email side by side */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Message full width */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              {/* Error message */}
              {errorMessage && formStatus === "error" && (
                <p className="text-red-500 text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {errorMessage}
                </p>
              )}

              {/* Bottom row — text + button */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-800 text-base font-bold leading-snug">
                    Want to discuss a project or opportunity?
                  </span>
                  <span className="text-slate-400 text-sm font-normal">
                    Feel free to reach out — I'd love to hear from you.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className={`px-10 py-3.5 rounded-full font-bold transition-all flex items-center gap-3 disabled:opacity-50 whitespace-nowrap
        ${formStatus === "success"
                      ? "bg-green-600 text-white"
                      : formStatus === "error"
                        ? "bg-red-600 text-white"
                        : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                    }`}
                >
                  {formStatus === "sending" ? (
                    <><span>Sending...</span><Loader2 size={18} className="animate-spin" /></>
                  ) : formStatus === "success" ? (
                    <><span>Sent Successfully!</span><CheckCircle2 size={18} /></>
                  ) : formStatus === "error" ? (
                    <><span>Failed to Send</span><AlertCircle size={18} /></>
                  ) : (
                    <><span>Send Message</span><Send size={18} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeComponent;
