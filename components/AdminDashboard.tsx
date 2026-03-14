"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  Lock,
  LogOut,
  CheckCircle,
  Award,
  GraduationCap,
  Image as ImageIcon,
  Globe,
  User,
  Briefcase,
  Mail,
  Upload,
  FileText,
  Github,
  Linkedin,
  Instagram,
  Facebook,
  RefreshCw,
  Type,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  PortfolioData,
  Project,
  Skill,
  Education,
  Certification,
  Experience,
  Blog,
} from "@/types";
import { apiClient } from "@/services/apiClient";
import RichTextEditor from "./RichTextEditor";

// ─── Helpers ──────────────────────────────────────────────

const uid = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function updateAtIndex<T>(arr: T[], idx: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === idx ? { ...item, ...patch } : item));
}

function removeById<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((item) => item.id !== id);
}

/**
 * Sanitize a filename: remove special chars, replace spaces with underscores.
 */
function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 100);
}

// ─── Reusable UI Atoms ───────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    {children}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full border p-3 md:p-4 rounded-2xl bg-white outline-none focus:ring-2 ring-indigo-500/10 ${props.className ?? ""}`}
  />
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (
  props,
) => (
  <textarea
    {...props}
    className={`w-full border p-3 md:p-4 rounded-2xl bg-white outline-none focus:ring-2 ring-indigo-500/10 resize-none ${props.className ?? ""}`}
  />
);

const DeleteBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
    aria-label="Delete"
  >
    <Trash2 size={20} />
  </button>
);

// ─── Types ────────────────────────────────────────────────

type TabKey =
  | "profile"
  | "projects"
  | "blogs"
  | "certs"
  | "exp"
  | "stacks"
  | "contact";
type SaveStatus = "idle" | "saving" | "success" | "error";

interface AdminProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
}

// ─── Component ────────────────────────────────────────────

const AdminDashboard: React.FC<AdminProps> = ({ data, onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [formData, setFormData] = useState<PortfolioData>({
    ...data,
    heroSubtitle: data.heroSubtitle || "",
    resumeUrl: data.resumeUrl || "",
    resumeFilename: data.resumeFilename || "",
    contactDetails: data.contactDetails || [],
    projects: data.projects || [],
    blogs: data.blogs || [],
    skills: data.skills || [],
    certifications: data.certifications || [],
    education: data.education || [],
    experiences: data.experiences || [],
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [resumeCustomName, setResumeCustomName] = useState(
    data.resumeFilename || data.name?.replace(/\s+/g, "_") || "Resume",
  );

  // ── Auth ──────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!password.trim()) {
      setLoginError("Please enter a password.");
      return;
    }
    setIsLoggingIn(true);
    const result = await apiClient.login(password);
    setIsLoggingIn(false);
    if (result.success) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      setLoginError(result.error || "Incorrect password.");
    }
  };

  // ── Save + Revalidate ─────────────────────────────

  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) {
      alert("Name is required before saving.");
      return;
    }
    setSaveStatus("saving");
    const success = await apiClient.updateData(formData);
    if (success) {
      onUpdate(formData);
      setSaveStatus("success");

      setIsRevalidating(true);
      await apiClient.revalidatePages();
      setIsRevalidating(false);

      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [formData, onUpdate]);

  // ── Profile Image Upload ──────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }
    setIsUploading(true);
    const url = await apiClient.uploadImage(file);
    setIsUploading(false);
    if (url) {
      setFormData((prev) => ({ ...prev, profileImageUrl: url }));
    } else {
      alert("Image upload failed. Check Cloudinary configuration.");
    }
  };

  // ── Resume Upload with Custom Filename ────────────

  const handleResumeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF or image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be smaller than 10 MB.");
      return;
    }

    // Use the custom name or fallback to owner name
    const customName = sanitizeFilename(
      resumeCustomName || formData.name || "Resume",
    );

    if (!customName) {
      alert("Please enter a filename for the resume.");
      return;
    }

    setIsUploadingResume(true);

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          filename: customName,
        }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({
          ...prev,
          resumeUrl: json.url,
          resumeFilename: customName,
        }));
      } else {
        alert(json.error || "Resume upload failed. Please try again.");
      }
    } catch {
      alert("Resume upload failed. Check your connection.");
    }

    setIsUploadingResume(false);
  };

  // ── Updaters ──────────────────────────────────────

  const updateField = <K extends keyof PortfolioData>(
    key: K,
    value: PortfolioData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocial = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }));
  };

  const updateContactDetail = (idx: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactDetails: updateAtIndex(prev.contactDetails, idx, { value }),
    }));
  };

  // ═══════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-blue-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            Secure access to portfolio management
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-center text-lg"
              placeholder="••••••••"
              autoFocus
              disabled={isLoggingIn}
            />
            {loginError && (
              <p className="text-red-500 text-sm font-medium">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-60"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                "Unlock Editor"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ═══════════════════════════════════════════════════

  const tabs: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Basic Info", icon: <User size={18} /> },
    { id: "contact", label: "Contact", icon: <Mail size={18} /> },
    { id: "stacks", label: "Tech Stacks", icon: <Globe size={18} /> },
    { id: "projects", label: "Projects", icon: <ImageIcon size={18} /> },
    { id: "blogs", label: "Blogs", icon: <FileText size={18} /> },
    { id: "certs", label: "Certs", icon: <Award size={18} /> },
    { id: "exp", label: "Exp & Edu", icon: <GraduationCap size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900">
            Portfolio Control
          </h1>
          <p className="text-indigo-600 flex items-center gap-2 text-sm mt-1 font-medium">
            <CheckCircle size={16} /> Live MongoDB Sync
            {isRevalidating && (
              <span className="text-amber-500 flex items-center gap-1 ml-2">
                <RefreshCw size={14} className="animate-spin" /> Rebuilding
                pages…
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg justify-center sm:min-w-[200px] ${saveStatus === "success"
                ? "bg-green-500 text-white"
                : saveStatus === "error"
                  ? "bg-red-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
          >
            {saveStatus === "saving" ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveStatus === "success" ? (
              <>
                <CheckCircle size={20} /> Saved &amp; Published!
              </>
            ) : saveStatus === "error" ? (
              <>Save Failed — Retry</>
            ) : (
              <>
                <Save size={20} /> Save &amp; Publish
              </>
            )}
          </button>
          <button
            onClick={async () => {
              await apiClient.logout();
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-all justify-center"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ─────────────────────────────── */}
        <div className="lg:w-64 space-y-2 overflow-x-auto lg:overflow-visible flex lg:flex-col pb-4 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex-shrink-0 lg:w-full text-left px-5 md:px-6 py-3 md:py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xl lg:translate-x-2"
                  : "text-slate-600 hover:bg-white"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content Area ────────────────────────── */}
        <div className="flex-grow bg-white/70 backdrop-blur rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 min-w-0">
          {/* ════════ PROFILE TAB ════════ */}
          {activeTab === "profile" && (
            <div className="space-y-12">
              <section className="space-y-8">
                <div className="flex items-center gap-3 text-indigo-600">
                  <User size={24} />
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Basic Identity
                  </h2>
                </div>

                {/* Name + Tagline */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Tagline</Label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => updateField("tagline", e.target.value)}
                      placeholder="e.g. Full-Stack Developer"
                    />
                  </div>
                </div>

                {/* Hero Subtitle */}
                <div className="space-y-2 p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Type size={16} className="text-indigo-600" />
                    <Label>Hero Subtitle</Label>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    This text appears below your tagline on the home page hero
                    section. Write a short, compelling introduction.
                  </p>
                  <TextArea
                    rows={3}
                    value={formData.heroSubtitle}
                    onChange={(e) =>
                      updateField("heroSubtitle", e.target.value)
                    }
                    maxLength={500}
                    placeholder="e.g. I build modern web experiences with clean code and thoughtful design..."
                  />
                  <p className="text-xs text-slate-400 text-right">
                    {formData.heroSubtitle?.length || 0} / 500
                  </p>
                </div>

                {/* Profile Picture + Email */}
                <div className="grid md:grid-cols-3 gap-8 pt-4">
                  <div className="space-y-4">
                    <Label>Profile Picture</Label>
                    <div className="relative group w-full aspect-square bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all">
                      {formData.profileImageUrl ? (
                        <img
                          src={formData.profileImageUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={40} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                        <Upload size={24} className="mb-2" />
                        <span className="text-xs font-bold uppercase">
                          Upload New
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label>Profile Image Link (Cloudinary)</Label>
                      <Input
                        value={formData.profileImageUrl}
                        onChange={(e) =>
                          updateField("profileImageUrl", e.target.value)
                        }
                        placeholder="https://res.cloudinary.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* ════════ RESUME UPLOAD WITH CUSTOM FILENAME ════════ */}
                <div className="space-y-4 p-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-600" />
                    <Label>Resume / CV</Label>
                  </div>
                  <p className="text-xs text-slate-400">
                    Upload your resume (PDF or image). Set a custom download
                    filename below — when visitors download your resume, the file
                    will be saved with this name.
                  </p>

                  {/* Custom Filename Input */}
                  <div className="space-y-2">
                    <Label>Download Filename</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={resumeCustomName}
                        onChange={(e) => setResumeCustomName(e.target.value)}
                        placeholder="e.g. Arnob_Dey"
                        className="!rounded-r-none"
                      />
                      <span className="px-4 py-3 md:py-4 bg-slate-100 border border-l-0 rounded-r-2xl text-slate-500 font-mono text-sm whitespace-nowrap">
                        .pdf
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Visitors will download:{" "}
                      <span className="font-mono font-bold text-emerald-600">
                        {sanitizeFilename(resumeCustomName || "Resume")}.pdf
                      </span>
                    </p>
                  </div>

                  {/* Upload + Preview + Remove Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <label
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all w-full sm:w-auto justify-center ${isUploadingResume
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                        }`}
                    >
                      {isUploadingResume ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Resume
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={handleResumeUpload}
                        disabled={isUploadingResume}
                      />
                    </label>

                    {formData.resumeUrl && (
                      <a
                        href={formData.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all w-full sm:w-auto justify-center"
                      >
                        <ExternalLink size={18} />
                        Preview
                      </a>
                    )}

                    {formData.resumeUrl && (
                      <a
                        href={formData.resumeUrl}
                        download={`${sanitizeFilename(resumeCustomName || "Resume")}.pdf`}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-all w-full sm:w-auto justify-center"
                      >
                        <Download size={18} />
                        Test Download
                      </a>
                    )}

                    {formData.resumeUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateField("resumeUrl", "");
                          updateField("resumeFilename", "");
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all w-full sm:w-auto justify-center"
                      >
                        <Trash2 size={18} />
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Resume URL (auto-filled) */}
                  <div className="space-y-2 pt-2">
                    <Label>Resume URL (auto-filled after upload)</Label>
                    <Input
                      value={formData.resumeUrl || ""}
                      onChange={(e) =>
                        updateField("resumeUrl", e.target.value)
                      }
                      placeholder="https://res.cloudinary.com/... or paste any URL"
                    />
                  </div>

                  {/* Status */}
                  {formData.resumeUrl ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 p-3 rounded-xl">
                      <CheckCircle size={16} />
                      <span>
                        Resume uploaded as{" "}
                        <span className="font-mono font-bold">
                          {formData.resumeFilename ||
                            sanitizeFilename(resumeCustomName || "Resume")}
                          .pdf
                        </span>{" "}
                        — visible on home page
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <FileText size={16} />
                      No resume uploaded — &quot;View my work&quot; button will
                      show instead
                    </div>
                  )}
                </div>

                {/* About Me */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-indigo-600" />
                    <Label>About Me (Full Biography)</Label>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Your detailed bio shown in the About section of the home
                    page. This is separate from the Hero Subtitle above.
                  </p>
                  <TextArea
                    rows={6}
                    value={formData.about}
                    onChange={(e) => updateField("about", e.target.value)}
                    placeholder="Write a compelling biography..."
                  />
                </div>
              </section>

              {/* Social Connections */}
              <section className="space-y-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Globe size={24} />
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Social Connections
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  {[
                    {
                      key: "github",
                      label: "GitHub",
                      icon: <Github size={12} />,
                      ph: "https://github.com/you",
                    },
                    {
                      key: "linkedin",
                      label: "LinkedIn",
                      icon: <Linkedin size={12} />,
                      ph: "https://linkedin.com/in/you",
                    },
                    {
                      key: "instagram",
                      label: "Instagram",
                      icon: <Instagram size={12} />,
                      ph: "https://instagram.com/you",
                    },
                    {
                      key: "facebook",
                      label: "Facebook",
                      icon: <Facebook size={12} />,
                      ph: "https://facebook.com/you",
                    },
                  ].map((s) => (
                    <div key={s.key} className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {s.icon} {s.label} URL
                      </label>
                      <Input
                        value={
                          formData.socials[
                          s.key as keyof typeof formData.socials
                          ] || ""
                        }
                        onChange={(e) => updateSocial(s.key, e.target.value)}
                        placeholder={s.ph}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ════════ CONTACT TAB ════════ */}
          {activeTab === "contact" && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                Get In Touch
              </h2>
              <p className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm border border-indigo-100">
                Contact fields are fixed. You can update the values only.
              </p>
              <div className="grid gap-6">
                {(formData.contactDetails || []).map((detail, idx) => (
                  <div
                    key={detail.id}
                    className="p-4 md:p-6 border rounded-2xl bg-white flex flex-col md:flex-row gap-4 items-center"
                  >
                    <div className="w-full md:w-1/4">
                      <Label>{detail.label}</Label>
                      <div className="w-full p-3 rounded-xl bg-slate-50 border mt-1 text-slate-400 font-medium">
                        Fixed Field
                      </div>
                    </div>
                    <div className="w-full md:flex-grow">
                      <Label>Value</Label>
                      <Input
                        className="mt-1 font-bold"
                        value={detail.value}
                        onChange={(e) =>
                          updateContactDetail(idx, e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ TECH STACKS TAB ════════ */}
          {activeTab === "stacks" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">Tech Stacks</h2>
                <button
                  type="button"
                  onClick={() =>
                    updateField("skills", [
                      ...formData.skills,
                      {
                        id: uid(),
                        name: "",
                        icon: "bg-indigo-500",
                        docUrl: "",
                      } as Skill,
                    ])
                  }
                  className="text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl w-full sm:w-auto text-center"
                >
                  + Add Skill
                </button>
              </div>
              <div className="grid gap-4">
                {formData.skills.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-2xl items-center bg-white"
                  >
                    <Input
                      className="md:!w-1/3 bg-slate-50 font-bold"
                      value={s.name}
                      placeholder="Skill Name"
                      onChange={(e) =>
                        updateField(
                          "skills",
                          updateAtIndex(formData.skills, idx, {
                            name: e.target.value,
                          }),
                        )
                      }
                    />
                    <Input
                      className="bg-slate-50"
                      value={s.docUrl}
                      placeholder="Documentation URL"
                      onChange={(e) =>
                        updateField(
                          "skills",
                          updateAtIndex(formData.skills, idx, {
                            docUrl: e.target.value,
                          }),
                        )
                      }
                    />
                    <DeleteBtn
                      onClick={() =>
                        updateField("skills", removeById(formData.skills, s.id))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PROJECTS TAB ════════ */}
          {activeTab === "projects" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">Projects</h2>
                <button
                  type="button"
                  onClick={() =>
                    updateField("projects", [
                      ...formData.projects,
                      {
                        id: uid(),
                        title: "New Project",
                        description: "",
                        imageUrl: "",
                        link: "",
                        videoUrl: "",
                        category: "web",
                        featured: true,
                      } as Project,
                    ])
                  }
                  className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-5 py-3 rounded-2xl w-full sm:w-auto justify-center"
                >
                  <Plus size={20} /> New Project
                </button>
              </div>
              <div className="grid gap-8">
                {formData.projects.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-6 md:p-8 border rounded-[2rem] bg-white space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        className="font-bold text-xl md:text-2xl bg-transparent border-b outline-none w-2/3 focus:border-indigo-600"
                        value={p.title}
                        onChange={(e) =>
                          updateField(
                            "projects",
                            updateAtIndex(formData.projects, idx, {
                              title: e.target.value,
                            }),
                          )
                        }
                      />
                      <DeleteBtn
                        onClick={() =>
                          updateField(
                            "projects",
                            removeById(formData.projects, p.id),
                          )
                        }
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Image URL</Label>
                        <Input
                          className="bg-slate-50"
                          value={p.imageUrl}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              updateAtIndex(formData.projects, idx, {
                                imageUrl: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Project Link</Label>
                        <Input
                          className="bg-slate-50"
                          value={p.link}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              updateAtIndex(formData.projects, idx, {
                                link: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Video URL</Label>
                        <Input
                          className="bg-slate-50"
                          value={p.videoUrl || ""}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              updateAtIndex(formData.projects, idx, {
                                videoUrl: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <select
                          className="w-full border p-3 md:p-4 rounded-2xl bg-slate-50 outline-none"
                          value={p.category}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              updateAtIndex(formData.projects, idx, {
                                category: e.target.value as Project["category"],
                              }),
                            )
                          }
                        >
                          <option value="web">Web</option>
                          <option value="mobile">Mobile</option>
                          <option value="ai">AI</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label>Description</Label>
                        <TextArea
                          rows={4}
                          className="bg-slate-50"
                          value={p.description}
                          onChange={(e) =>
                            updateField(
                              "projects",
                              updateAtIndex(formData.projects, idx, {
                                description: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ BLOGS TAB ════════ */}
          {activeTab === "blogs" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">Blog Posts</h2>
                <button
                  type="button"
                  onClick={() =>
                    updateField("blogs", [
                      ...formData.blogs,
                      {
                        id: uid(),
                        title: "New Blog Post",
                        excerpt: "",
                        imageUrl: "",
                        date: new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }),
                        link: "",
                      } as Blog,
                    ])
                  }
                  className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-5 py-3 rounded-2xl w-full sm:w-auto justify-center"
                >
                  <Plus size={20} /> New Post
                </button>
              </div>
              <div className="grid gap-8">
                {formData.blogs.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-6 md:p-8 border rounded-[2rem] bg-white space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        className="font-bold text-xl bg-transparent border-b outline-none w-2/3 focus:border-indigo-600"
                        value={b.title}
                        onChange={(e) =>
                          updateField(
                            "blogs",
                            updateAtIndex(formData.blogs, idx, {
                              title: e.target.value,
                            }),
                          )
                        }
                      />
                      <DeleteBtn
                        onClick={() =>
                          updateField("blogs", removeById(formData.blogs, b.id))
                        }
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Cover Image URL</Label>
                        <Input
                          className="bg-slate-50"
                          value={b.imageUrl}
                          onChange={(e) =>
                            updateField(
                              "blogs",
                              updateAtIndex(formData.blogs, idx, {
                                imageUrl: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input
                          className="bg-slate-50"
                          value={b.date}
                          onChange={(e) =>
                            updateField(
                              "blogs",
                              updateAtIndex(formData.blogs, idx, {
                                date: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label>Blog Link (external)</Label>
                        <Input
                          className="bg-slate-50"
                          value={b.link || ""}
                          placeholder="https://medium.com/..."
                          onChange={(e) =>
                            updateField(
                              "blogs",
                              updateAtIndex(formData.blogs, idx, {
                                link: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label>Excerpt / Summary</Label>
                        <TextArea
                          rows={4}
                          className="bg-slate-50"
                          value={b.excerpt}
                          onChange={(e) =>
                            updateField(
                              "blogs",
                              updateAtIndex(formData.blogs, idx, {
                                excerpt: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ CERTIFICATIONS TAB ════════ */}
          {activeTab === "certs" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Certifications
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    updateField("certifications", [
                      ...formData.certifications,
                      {
                        id: uid(),
                        title: "",
                        issuer: "",
                        date: "",
                        imageUrl: "",
                        link: "",
                      } as Certification,
                    ])
                  }
                  className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-5 py-3 rounded-2xl w-full sm:w-auto justify-center"
                >
                  <Plus size={20} /> New Cert
                </button>
              </div>
              <div className="grid gap-6">
                {formData.certifications.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className="p-6 border rounded-[2rem] bg-white space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        className="font-bold text-xl bg-transparent border-b outline-none w-full mr-4 focus:border-indigo-600"
                        placeholder="Certificate Title"
                        value={cert.title}
                        onChange={(e) =>
                          updateField(
                            "certifications",
                            updateAtIndex(formData.certifications, idx, {
                              title: e.target.value,
                            }),
                          )
                        }
                      />
                      <DeleteBtn
                        onClick={() =>
                          updateField(
                            "certifications",
                            removeById(formData.certifications, cert.id),
                          )
                        }
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Issuer</Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="e.g. Google"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateField(
                              "certifications",
                              updateAtIndex(formData.certifications, idx, {
                                issuer: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="e.g. Jan 2025"
                          value={cert.date}
                          onChange={(e) =>
                            updateField(
                              "certifications",
                              updateAtIndex(formData.certifications, idx, {
                                date: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Image URL</Label>
                        <Input
                          className="bg-slate-50"
                          value={cert.imageUrl}
                          onChange={(e) =>
                            updateField(
                              "certifications",
                              updateAtIndex(formData.certifications, idx, {
                                imageUrl: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Verification Link</Label>
                        <Input
                          className="bg-slate-50"
                          value={cert.link}
                          onChange={(e) =>
                            updateField(
                              "certifications",
                              updateAtIndex(formData.certifications, idx, {
                                link: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ EXPERIENCE & EDUCATION TAB ════════ */}
          {activeTab === "exp" && (
            <div className="space-y-12">
              {/* Experience */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Briefcase className="text-indigo-600" /> Experience
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("experiences", [
                        ...formData.experiences,
                        {
                          id: uid(),
                          role: "",
                          company: "",
                          duration: "",
                          description: "",
                        } as Experience,
                      ])
                    }
                    className="text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl"
                  >
                    + Add Exp
                  </button>
                </div>
                {formData.experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-6 border rounded-[2rem] bg-white space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        className="font-bold text-lg border-b outline-none w-2/3 focus:border-indigo-600"
                        placeholder="Job Title / Role"
                        value={exp.role}
                        onChange={(e) =>
                          updateField(
                            "experiences",
                            updateAtIndex(formData.experiences, idx, {
                              role: e.target.value,
                            }),
                          )
                        }
                      />
                      <DeleteBtn
                        onClick={() =>
                          updateField(
                            "experiences",
                            removeById(formData.experiences, exp.id),
                          )
                        }
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Company</Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="e.g. Google"
                          value={exp.company}
                          onChange={(e) =>
                            updateField(
                              "experiences",
                              updateAtIndex(formData.experiences, idx, {
                                company: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Duration</Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="e.g. Jan 2023 – Present"
                          value={exp.duration}
                          onChange={(e) =>
                            updateField(
                              "experiences",
                              updateAtIndex(formData.experiences, idx, {
                                duration: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* ═══ RICH TEXT EDITOR FOR DESCRIPTION ═══ */}
                    <div className="space-y-1">
                      <Label>Description (Rich Text)</Label>
                      <p className="text-xs text-slate-400 mb-2">
                        Use bold, bullets, links, etc. to format your experience
                        description. It will display exactly as you write it on
                        the homepage.
                      </p>
                      <RichTextEditor
                        value={exp.description}
                        onChange={(newContent) =>
                          updateField(
                            "experiences",
                            updateAtIndex(formData.experiences, idx, {
                              description: newContent,
                            }),
                          )
                        }
                        placeholder="Describe your role, responsibilities, and achievements..."
                        height={200}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-6 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <GraduationCap className="text-indigo-600" /> Education
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      updateField("education", [
                        ...formData.education,
                        {
                          id: uid(),
                          degree: "",
                          school: "",
                          year: "",
                          achievements: [],
                        } as Education,
                      ])
                    }
                    className="text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl"
                  >
                    + Add Edu
                  </button>
                </div>
                {formData.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="p-6 border rounded-[2rem] bg-white space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        className="font-bold text-lg border-b outline-none w-2/3 focus:border-indigo-600"
                        placeholder="Degree / Program"
                        value={edu.degree}
                        onChange={(e) =>
                          updateField(
                            "education",
                            updateAtIndex(formData.education, idx, {
                              degree: e.target.value,
                            }),
                          )
                        }
                      />
                      <DeleteBtn
                        onClick={() =>
                          updateField(
                            "education",
                            removeById(formData.education, edu.id),
                          )
                        }
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>School / University</Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="e.g. MIT"
                          value={edu.school}
                          onChange={(e) =>
                            updateField(
                              "education",
                              updateAtIndex(formData.education, idx, {
                                school: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Year</Label>
                        <Input
                          className="bg-slate-50"
                          placeholder="e.g. 2020 – 2024"
                          value={edu.year}
                          onChange={(e) =>
                            updateField(
                              "education",
                              updateAtIndex(formData.education, idx, {
                                year: e.target.value,
                              }),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Achievements (one per line)</Label>
                      <TextArea
                        rows={3}
                        className="bg-slate-50 text-sm"
                        value={edu.achievements.join("\n")}
                        onChange={(e) =>
                          updateField(
                            "education",
                            updateAtIndex(formData.education, idx, {
                              achievements: e.target.value.split("\n"),
                            }),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;