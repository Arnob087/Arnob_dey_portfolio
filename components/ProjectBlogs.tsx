"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play, ExternalLink, Calendar, ChevronRight, Award,
  ShieldCheck, X, FolderOpen,
} from "lucide-react";
import { PortfolioData } from "@/types";
import RichContent from "./RichContent";

interface Props {
  data: PortfolioData;
}

const getYoutubeId = (url: string): string | null => {
  const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

const getThumb = (url: string): string => {
  const id = getYoutubeId(url);
  return id
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800";
};

const ProjectsBlogs: React.FC<Props> = ({ data }) => {
  const [filter, setFilter]       = useState<"all" | "web" | "mobile" | "ai">("all");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const projects       = data.projects       || [];
  const blogs          = data.blogs          || [];
  const certifications = data.certifications || [];

  const filtered      = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const projectVideos = projects.filter((p) => p.videoUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-20 md:space-y-32">

      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Works &amp; Credentials
        </h1>
        <p className="text-base md:text-lg text-slate-600">
          A detailed exploration of my projects, articles, and certifications.
        </p>
      </div>

      {/* ── Projects ──────────────────────────────────────── */}
      {projects.length > 0 && (
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-6">
            <h2 className="font-serif text-3xl font-bold">Project Details</h2>
            <div className="flex flex-wrap gap-2 p-1 bg-white/50 backdrop-blur rounded-full border border-slate-100 shadow-sm">
              {(["all", "web", "mobile", "ai"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === cat
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 flex flex-col"
                >
                  <div className="flex flex-col md:flex-row flex-1">
                    {/* Thumbnail */}
                    <div className="md:w-2/5 relative overflow-hidden h-48 md:h-auto flex-shrink-0">
                      {project.imageUrl ? (
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center min-h-[12rem]">
                          <FolderOpen size={48} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="md:w-3/5 p-6 md:p-8 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mb-2">
                        {project.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight">
                        {project.title}
                      </h3>

                      {/* ✅ Project description — rich text from Quill */}
                      <div className="flex-grow mb-4 min-w-0 max-h-[30vh] overflow-auto">
                        <RichContent
                          html={project.description}
                          className="text-slate-500 text-sm leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-slate-100 mt-auto">
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                          >
                            Live Preview <ExternalLink size={14} />
                          </a>
                        )}
                        {project.videoUrl && (
                          <button
                            onClick={() => setActiveVideo(project.videoUrl!)}
                            className="text-sm font-bold text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition-colors"
                          >
                            <Play size={14} /> Watch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No projects in &quot;{filter}&quot; category.</p>
            </div>
          )}
        </section>
      )}

      {/* ── Videos ────────────────────────────────────────── */}
      {projectVideos.length > 0 && (
        <section className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]" />
          <div className="mb-10 relative z-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Project Videos</h2>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Deep dives and walkthroughs of my work.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {projectVideos.map((p) => (
              <div
                key={p.id}
                className="group cursor-pointer"
                onClick={() => setActiveVideo(p.videoUrl!)}
              >
                <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden mb-4 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                  <Image
                    src={getThumb(p.videoUrl!)}
                    alt={`${p.title} thumbnail`}
                    fill
                    className="object-cover opacity-60 group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play fill="white" size={20} />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-1 group-hover:text-indigo-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-slate-400 text-xs italic">Video Overview</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Blogs ─────────────────────────────────────────── */}
      {blogs.length > 0 && (
        <section>
          <h2 className="font-serif text-3xl font-bold mb-10 md:mb-12">Technical Writings</h2>
          <div className="space-y-6 md:space-y-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-6 rounded-[2rem] hover:bg-white/60 hover:shadow-xl transition-all border border-transparent hover:border-blue-100"
              >
                {blog.imageUrl && (
                  <div className="md:w-1/3 aspect-[16/9] md:aspect-auto md:h-64 rounded-2xl overflow-hidden relative flex-shrink-0">
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}

                <div className={`${blog.imageUrl ? "md:w-2/3" : "w-full"} flex flex-col justify-center min-w-0`}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-3">
                    <Calendar size={14} />
                    <span>{blog.date}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                    {blog.title}
                  </h3>

                  {/* ✅ Blog excerpt — rich text from Quill, visually clamped */}
                  <div className="mb-4 overflow-hidden" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }}>
                    <RichContent
                      html={blog.excerpt}
                      className="text-slate-500 text-sm md:text-base leading-relaxed"
                    />
                  </div>

                  {blog.link ? (
                    <a
                      href={blog.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-indigo-600 font-bold text-xs md:text-sm uppercase tracking-wider group/btn w-fit"
                    >
                      Read article
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <button className="flex items-center gap-1 text-indigo-600 font-bold text-xs md:text-sm uppercase tracking-wider group/btn w-fit">
                      Read article
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Certifications ────────────────────────────────── */}
      {certifications.length > 0 && (
        <section className="pb-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl font-bold mb-4">Professional Certifications</h2>
            <p className="text-slate-500 text-sm md:text-base">Verified credentials from industry leaders.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-white/80 backdrop-blur p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group flex flex-col items-center text-center"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-50 flex items-center justify-center p-4 relative">
                  {cert.imageUrl ? (
                    <Image
                      src={cert.imageUrl}
                      alt={cert.title}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  ) : (
                    <Award size={48} className="text-slate-300" />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 leading-tight text-sm md:text-base">
                  {cert.title}
                </h3>
                <p className="text-sm text-indigo-600 font-semibold mb-1">{cert.issuer}</p>
                <p className="text-xs text-slate-400 mb-6">{cert.date}</p>
                {cert.link && (
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto w-full px-6 py-2 rounded-full border border-slate-200 text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} /> Verify
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Video Modal ───────────────────────────────────── */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 md:top-6 right-4 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-indigo-600 text-white flex items-center justify-center transition-all"
              aria-label="Close video"
            >
              <X size={24} />
            </button>
            {getYoutubeId(activeVideo) ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo)}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video className="w-full h-full" src={activeVideo} controls autoPlay>
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsBlogs;