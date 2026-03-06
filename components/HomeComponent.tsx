"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight, Mail, MapPin, Send, CheckCircle2, ExternalLink,
  Award, AlertCircle, Loader2, User, Phone, Globe,
  FileText,
  Download,
} from "lucide-react";
import { PortfolioData, ContactDetail } from "@/types";
import { apiClient } from "@/services/apiClient";
import RichContent from "./RichContent";

interface HomeProps {
  data: PortfolioData;
}

const HomeComponent: React.FC<HomeProps> = ({ data }) => {
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    setErrorMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
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
      case "mail": return <Mail size={20} />;
      case "phone": return <Phone size={20} />;
      case "map-pin": return <MapPin size={20} />;
      default: return <Mail size={20} />;
    }
  };

  const experiences = data.experiences || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const contactDetails = data.contactDetails || [];

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
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl">
            {data.heroSubtitle || ""}
          </p>
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
            {/* Left Column */}
            <div className="md:w-1/3">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6">
                Experience
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                A journey through diverse challenges and professional growth.
              </p>
            </div>

            {/* Right Column — Timeline */}
            <div className="md:w-2/3 space-y-8 md:space-y-12">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="relative pl-6 md:pl-8 border-l-2 border-indigo-100 hover:border-indigo-600 transition-colors group"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600" />

                  {/* Duration */}
                  <span className="text-xs md:text-sm font-semibold text-indigo-600 mb-1.5 md:mb-2 block">
                    {exp.duration}
                  </span>

                  {/* Role */}
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 break-words">
                    {exp.role}
                  </h3>

                  {/* Company */}
                  <p className="text-slate-500 font-medium mb-3 md:mb-4 text-sm md:text-base break-words">
                    {exp.company}
                  </p>

                  {/* Description — Rich Content */}
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
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-6 md:mb-8">Passion for Technology, Commitment to Excellence</h2>
              <div className="space-y-6 text-slate-600 text-balance md:text-lg leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
                <p>{data.about}</p>
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

      {/* ── Education ─────────────────────────────── */}
      {education.length > 0 && (
        <section id="education" className="bg-white/40 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              <div className="md:w-1/3">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-6">Education</h2>
                <p className="text-slate-500">My academic path and notable achievements.</p>
              </div>
              <div className="md:w-2/3 space-y-6 md:space-y-8">
                {education.map((edu) => (
                  <div key={edu.id} className="p-6 md:p-10 rounded-[2rem] bg-blue-50/50 border border-blue-100 hover:border-indigo-200 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{edu.year}</span>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-3">{edu.degree}</h3>
                        <p className="text-slate-500 text-base md:text-lg">{edu.school}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform hidden sm:block">
                        <Award className="text-indigo-600" size={32} />
                      </div>
                    </div>
                    {edu.achievements?.filter(Boolean).length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Achievements</p>
                        {edu.achievements.filter(Boolean).map((ach, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-slate-600 text-sm md:text-base">
                            <CheckCircle2 size={16} className="text-green-500 mt-1 flex-shrink-0" />
                            <p>{ach}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-4">Technical Stacks</h2>
            <p className="text-slate-500">The tools and languages I&apos;ve mastered.</p>
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
                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${skill.icon || "bg-indigo-500"} group-hover:scale-125 transition-transform`} />
                <span className="font-bold text-base md:text-lg text-slate-700 group-hover:text-indigo-600 transition-colors">{skill.name}</span>
                <ExternalLink size={12} className="text-slate-300 group-hover:text-indigo-400" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Contact ───────────────────────────────── */}
      <section id="contact" className="max-w-7xl mx-auto px-4">
        <div className="rounded-2xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <div className="lg:w-1/3 bg-indigo-600 p-8 md:p-12 text-white">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">Get in Touch</h2>
            <div className="space-y-6 md:space-y-8">
              {contactDetails.map((detail) => (
                <div key={detail.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {getContactIcon(detail.icon)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-indigo-100 text-xs">{detail.label}</p>
                    <span className="font-medium text-sm md:text-base">{detail.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 bg-white/95 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none" placeholder="Tell me about your project..." />
              </div>

              {errorMessage && formStatus === "error" && (
                <p className="text-red-500 text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {errorMessage}
                </p>
              )}

              <button type="submit" disabled={formStatus === "sending"} className={`w-full md:w-auto px-10 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${formStatus === "success" ? "bg-green-600 text-white" : formStatus === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg"}`}>
                {formStatus === "sending" ? (<>Sending... <Loader2 size={20} className="animate-spin" /></>) : formStatus === "success" ? (<>Sent Successfully! <CheckCircle2 size={20} /></>) : formStatus === "error" ? (<>Failed to Send <AlertCircle size={20} /></>) : (<>Send Message <Send size={20} /></>)}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeComponent;