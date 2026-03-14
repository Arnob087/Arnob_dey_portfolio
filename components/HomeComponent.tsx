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
      <section className="min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center max-w-7xl mx-auto px-4 pt-10 relative">
        {/* Subtle Hero Background Elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] -z-10 animate-float" />
        
        <div className="max-w-3xl relative z-10">
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
        <section id="experience" className="max-w-7xl mx-auto px-4 relative">
          {/* Background Decorative Blur */}
          <div className="absolute top-20 -left-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10 animate-pulse-slow" />
          
          <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
              <div className="lg:w-1/3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/5 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-600/10">
                  <Award size={14} /> Journey
                </div>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Professional <span className="text-indigo-600">Growth</span>
                </h2>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                  A timeline of diverse challenges, leadership roles, and the evolution of my technical expertise.
                </p>
              </div>

              <div className="lg:w-2/3 space-y-10 md:space-y-14 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-0 top-2 bottom-2 w-[1px] bg-gradient-to-b from-indigo-500/50 via-indigo-500/20 to-transparent" />
                
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative pl-8 md:pl-12 group/exp"
                  >
                    {/* Ring Indicator */}
                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-600 group-hover/exp:scale-150 transition-transform duration-300 z-10" />
                    <div className="absolute -left-[12px] top-0 w-6 h-6 rounded-full bg-indigo-600/10 opacity-0 group-hover/exp:opacity-100 transition-opacity duration-300" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100/50">
                        {exp.duration}
                      </span>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 group-hover/exp:text-indigo-600 transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-slate-500 font-bold mb-5 text-sm md:text-base flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-200" /> {exp.company}
                    </p>
                    
                    <div className="min-w-0 overflow-hidden bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/50 group-hover/exp:bg-white/50 transition-all duration-500 shadow-sm hover:shadow-md">
                      <RichContent
                        html={exp.description}
                        className="text-slate-600 leading-relaxed text-sm md:text-base prose-sm max-w-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Shimmer overlay for premium feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
          </div>
        </section>
      )}

      {/* ── About Me ──────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-4 relative">
        {/* Animated Background Orbs */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        
        <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden relative group hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.08)] transition-all duration-700">
          {/* Subtle decorative grid/pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-center relative z-10">
            {/* Left Content Column - now 1/2 */}
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600/5 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-600/10 shadow-sm transition-transform hover:scale-105">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <User size={14} /> My Story
              </div>
              
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-[1.2] tracking-tight">
                Crafting Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Experiences</span> with Purpose
              </h2>
              
              <div className="space-y-6 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                <div className="relative max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
                  <div className="absolute -left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent rounded-full opacity-20 hidden md:block" />
                  <RichContent 
                    html={data.about} 
                    className="prose prose-slate max-w-none text-slate-600/90"
                  />
                </div>
              </div>
            </div>

            {/* Right Image Column - now 1/2 */}
            <div className="lg:w-1/2 order-1 lg:order-2 w-full max-w-md lg:max-w-none mx-auto shrink-0 px-4">
              <div className="relative group/img">
                {/* Holographic/Glass decorative frame */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-white/50 to-blue-500/20 rounded-[3.5rem] blur-xl opacity-0 group-hover/img:opacity-100 transition-all duration-1000 animate-pulse-slow" />
                <div className="absolute inset-0 border-[1px] border-white/60 rounded-[3rem] z-20 pointer-events-none shadow-inner" />
                
                <div className="relative z-10 p-2 bg-white/20 backdrop-blur-md rounded-[3.2rem] border border-white/50 shadow-2xl transition-transform duration-700 group-hover/img:scale-[1.02] group-hover/img:-rotate-1">
                  {data.profileImageUrl ? (
                    <Image
                      src={data.profileImageUrl}
                      alt={data.name}
                      width={600}
                      height={750}
                      className="rounded-[2.8rem] shadow-sm w-full object-cover aspect-[4/5] filter saturate-[1.1] contrast-[1.05]"
                      priority
                    />
                  ) : (
                    <div className="rounded-[2.8rem] w-full aspect-[4/5] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <User size={100} className="text-slate-400 opacity-20" />
                    </div>
                  )}
                  
                  {/* Floating Accent Icon */}
                  <div className="absolute -bottom-6 -right-6 p-5 bg-white rounded-3xl shadow-xl border border-slate-100 animate-float hidden md:flex items-center justify-center">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Globe className="text-indigo-600" size={28} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects Highlight Carousel ───────────────── */}
      {visibleProjects.length > 0 && (
        <section id="projects-carousel" className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/5 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-600/10">
                <ExternalLink size={12} /> Spotlight
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                Project <span className="text-indigo-600">Highlights</span>
              </h2>
            </div>
          </div>

          <div
            className="relative w-full h-[520px] flex items-center justify-center group/carousel"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {visibleProjects.map((p, i) => {
              const N = visibleProjects.length;
              let diff = (i - activeIndex + N) % N;
              if (diff > Math.floor(N / 2)) diff -= N;

              const isActive = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;
              const isHidden = Math.abs(diff) > 1;

              return (
                <article
                  key={p.id}
                  onClick={() => {
                    if (isLeft) prev();
                    else if (isRight) next();
                    else if (isActive) handleCardClick();
                  }}
                  style={{
                    transform: isActive
                      ? "translateX(0px) scale(1)"
                      : isLeft
                        ? "translateX(-360px) scale(0.85)"
                        : isRight
                          ? "translateX(360px) scale(0.85)"
                          : `translateX(${diff < 0 ? -500 : 500}px) scale(0.7)`,
                    opacity: isActive ? 1 : isLeft || isRight ? 0.6 : 0,
                    zIndex: isActive ? 30 : isLeft || isRight ? 20 : 5,
                    pointerEvents: isHidden ? "none" : "auto",
                  }}
                  className="absolute w-[350px] sm:w-[400px] h-[500px] rounded-[3rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group"
                >
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-200" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-indigo-300 transition-colors">
                      {p.title}
                    </h3>
                    <div className="text-white/70 text-sm line-clamp-3 mb-6 font-medium">
                      <RichContent html={p.description || ""} />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                      Explore Project <ChevronRight size={16} />
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
        <section id="education" className="max-w-7xl mx-auto px-4 relative">
          {/* Background Decorative Blur */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-float" />
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="lg:w-1/3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/5 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-600/10">
                <Award size={14} /> Academics
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Education & <span className="text-blue-600">Foundation</span>
              </h2>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                The academic foundation that fueled my passion for technology and lifelong learning.
              </p>
            </div>
            
            <div className="lg:w-2/3 grid gap-8 sm:gap-10">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.08)] transition-all duration-700 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                      <div className="flex-1">
                        <span className="inline-block text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm mb-4">
                          {edu.year}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {edu.degree}
                        </h3>
                        <p className="text-slate-500 text-lg md:text-xl font-medium">
                          {edu.school}
                        </p>
                      </div>
                      <div className="p-5 rounded-3xl bg-white shadow-lg border border-slate-50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0 bg-gradient-to-br from-white to-blue-50">
                        <Award className="text-blue-600" size={36} />
                      </div>
                    </div>
                    
                    {edu.achievements?.filter(Boolean).length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-slate-100/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                          Key Achievements
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {edu.achievements.filter(Boolean).map((ach, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-4 rounded-2xl bg-white/20 border border-white/40 hover:bg-white/50 transition-colors"
                            >
                              <CheckCircle2
                                size={18}
                                className="text-blue-500 mt-0.5 flex-shrink-0"
                              />
                              <div className="text-slate-600 text-sm md:text-base font-medium">
                                <RichContent html={ach} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
      <section id="contact" className="max-w-7xl mx-auto px-4 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-float" />

        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[4rem] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden relative group">
          {/* Subtle Inner Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="flex flex-col lg:flex-row relative z-10">
            {/* Sidebar info */}
            <div className="lg:w-1/3 bg-indigo-600/95 p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
               {/* Decorative circle for the sidebar */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
               
               <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-white/20">
                   <Mail size={12} /> Contact Info
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-10 leading-tight">
                  Let&apos;s build <br /> something <span className="italic text-indigo-200">great</span>.
                </h2>
                
                <div className="space-y-8">
                  {contactDetails.map((detail) => (
                    <div key={detail.id} className="flex items-center gap-5 group/item transition-transform hover:translate-x-1">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover/item:bg-white/20 group-hover/item:border-white/30 transition-all">
                        {getContactIcon(detail.icon)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-indigo-200 text-[11px] font-bold uppercase tracking-wider mb-0.5">{detail.label}</p>
                        <span className="font-medium text-base md:text-lg">
                          {detail.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
               </div>

               <div className="mt-16 pt-8 border-t border-white/10">
                 <p className="text-white/60 text-sm">Based in Bangladesh, <br />Available for global opportunities.</p>
               </div>
            </div>

            {/* Form side */}
            <div className="lg:w-2/3 p-10 md:p-20">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3 group/field">
                    <label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 transition-colors group-focus-within/field:text-indigo-600">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-7 py-5 rounded-2xl bg-white/80 border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300 shadow-sm hover:border-slate-300 focus:shadow-[0_0_20px_rgba(79,70,229,0.15)] focus:scale-[1.01]"
                        placeholder="e.g. John Smith"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 group/field">
                    <label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 transition-colors group-focus-within/field:text-indigo-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-7 py-5 rounded-2xl bg-white/80 border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300 shadow-sm hover:border-slate-300 focus:shadow-[0_0_20px_rgba(79,70,229,0.15)] focus:scale-[1.01]"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 group/field">
                  <label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 transition-colors group-focus-within/field:text-indigo-600">
                    Your Message
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-7 py-5 rounded-[2rem] bg-white/80 border-2 border-slate-100 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300 shadow-sm hover:border-slate-300 focus:shadow-[0_0_20px_rgba(79,70,229,0.15)] focus:scale-[1.01] resize-none"
                      placeholder="Briefly describe your project or inquiry..."
                    />
                  </div>
                </div>

                {errorMessage && formStatus === "error" && (
                  <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                    <AlertCircle size={18} /> {errorMessage}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-6 pt-4">
                  <div className="max-w-[300px]">
                     <p className="text-slate-900 font-bold mb-1">Send a message</p>
                     <p className="text-slate-400 text-xs">I typically respond within 24 hours. Let&apos;s start a conversation.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === "sending"}
                    className={`px-12 py-5 rounded-full font-black text-[13px] uppercase tracking-widest transition-all flex items-center gap-4 disabled:opacity-50 group hover:scale-[1.02] active:scale-95 shadow-xl
                    ${formStatus === "success"
                        ? "bg-green-600 text-white shadow-green-600/20"
                        : formStatus === "error"
                          ? "bg-red-600 text-white shadow-red-600/20"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
                      }`}
                  >
                    {formStatus === "sending" ? (
                      <><span>Sending</span><Loader2 size={18} className="animate-spin" /></>
                    ) : formStatus === "success" ? (
                      <><span>Message Sent</span><CheckCircle2 size={18} /></>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeComponent;
