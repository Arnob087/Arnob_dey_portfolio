/**
 * Sanitize and validate inputs before they reach the database.
 */

import { PortfolioData } from "@/types";

/** Strip ALL HTML tags from a string (for plain text fields) */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/** Sanitize a string: trim, strip HTML, limit length */
export function sanitizeString(str: unknown, maxLength = 5000): string {
  if (typeof str !== "string") return "";
  return stripHtml(str).trim().slice(0, maxLength);
}

/**
 * Sanitize HTML content: allow safe tags, remove dangerous ones.
 * Used for rich text fields (e.g., experience description, blog excerpt).
 */
export function sanitizeHtmlContent(str: unknown, maxLength = 10000): string {
  if (typeof str !== "string") return "";

  let cleaned = str.trim().slice(0, maxLength);

  // Remove script tags and their content
  cleaned = cleaned.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove event handlers (onclick, onerror, onload, etc.)
  cleaned = cleaned.replace(
    /\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
    "",
  );

  // Remove javascript: URLs
  cleaned = cleaned.replace(
    /href\s*=\s*["']?\s*javascript\s*:/gi,
    'href="',
  );

  // Remove iframe, object, embed, form tags
  cleaned = cleaned.replace(
    /<\/?(iframe|object|embed|form|input|button|select|textarea)\b[^>]*>/gi,
    "",
  );

  // Remove style tags and their content
  cleaned = cleaned.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    "",
  );

  return cleaned;
}

/** Sanitize a URL: must start with http:// or https:// */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (
    trimmed === "" ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed.slice(0, 2000);
  }
  return "";
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Deep sanitize the entire PortfolioData object before saving to MongoDB.
 * Prevents XSS, injection, and oversized payloads.
 */
export function sanitizePortfolioData(data: unknown): PortfolioData | null {
  if (!data || typeof data !== "object") return null;

  const d = data as Record<string, unknown>;

  try {
    const sanitized: PortfolioData = {
      name: sanitizeString(d.name, 100),
      tagline: sanitizeString(d.tagline, 200),
      heroSubtitle: sanitizeString(d.heroSubtitle, 500),
      about: sanitizeString(d.about, 5000),
      email: sanitizeString(d.email, 320),
      profileImageUrl: sanitizeUrl(d.profileImageUrl),
      resumeUrl: sanitizeUrl(d.resumeUrl),
      resumeFilename: sanitizeString(d.resumeFilename, 100),
      socials: {
        github: sanitizeUrl((d.socials as Record<string, unknown>)?.github),
        linkedin: sanitizeUrl(
          (d.socials as Record<string, unknown>)?.linkedin,
        ),
        instagram: sanitizeUrl(
          (d.socials as Record<string, unknown>)?.instagram,
        ),
        facebook: sanitizeUrl(
          (d.socials as Record<string, unknown>)?.facebook,
        ),
      },
      projects: Array.isArray(d.projects)
        ? d.projects.slice(0, 50).map((p: Record<string, unknown>) => ({
            id: sanitizeString(p.id, 50),
            title: sanitizeString(p.title, 200),
            description: sanitizeString(p.description, 2000),
            imageUrl: sanitizeUrl(p.imageUrl),
            link: sanitizeUrl(p.link),
            videoUrl: sanitizeUrl(p.videoUrl),
            category: ["web", "mobile", "ai"].includes(p.category as string)
              ? (p.category as "web" | "mobile" | "ai")
              : "web",
            featured: Boolean(p.featured),
          }))
        : [],
      blogs: Array.isArray(d.blogs)
        ? d.blogs.slice(0, 50).map((b: Record<string, unknown>) => ({
            id: sanitizeString(b.id, 50),
            title: sanitizeString(b.title, 300),
            excerpt: sanitizeHtmlContent(b.excerpt, 2000),
            imageUrl: sanitizeUrl(b.imageUrl),
            date: sanitizeString(b.date, 50),
            link: sanitizeUrl(b.link),
          }))
        : [],
      experiences: Array.isArray(d.experiences)
        ? d.experiences.slice(0, 20).map((e: Record<string, unknown>) => ({
            id: sanitizeString(e.id, 50),
            role: sanitizeString(e.role, 200),
            company: sanitizeString(e.company, 200),
            duration: sanitizeString(e.duration, 100),
            description: sanitizeHtmlContent(e.description, 5000),
          }))
        : [],
      skills: Array.isArray(d.skills)
        ? d.skills.slice(0, 50).map((s: Record<string, unknown>) => ({
            id: sanitizeString(s.id, 50),
            name: sanitizeString(s.name, 100),
            icon: sanitizeString(s.icon, 100),
            docUrl: sanitizeUrl(s.docUrl),
          }))
        : [],
      education: Array.isArray(d.education)
        ? d.education.slice(0, 10).map((e: Record<string, unknown>) => ({
            id: sanitizeString(e.id, 50),
            degree: sanitizeString(e.degree, 200),
            school: sanitizeString(e.school, 200),
            year: sanitizeString(e.year, 50),
            achievements: Array.isArray(e.achievements)
              ? e.achievements
                  .slice(0, 20)
                  .map((a: unknown) => sanitizeString(a, 500))
              : [],
          }))
        : [],
      certifications: Array.isArray(d.certifications)
        ? d.certifications
            .slice(0, 30)
            .map((c: Record<string, unknown>) => ({
              id: sanitizeString(c.id, 50),
              title: sanitizeString(c.title, 300),
              issuer: sanitizeString(c.issuer, 200),
              date: sanitizeString(c.date, 50),
              imageUrl: sanitizeUrl(c.imageUrl),
              link: sanitizeUrl(c.link),
            }))
        : [],
      contactDetails: Array.isArray(d.contactDetails)
        ? d.contactDetails
            .slice(0, 10)
            .map((c: Record<string, unknown>) => ({
              id: sanitizeString(c.id, 50),
              icon: ["mail", "phone", "map-pin"].includes(c.icon as string)
                ? (c.icon as "mail" | "phone" | "map-pin")
                : "mail",
              label: sanitizeString(c.label, 100),
              value: sanitizeString(c.value, 500),
            }))
        : [],
    };

    return sanitized;
  } catch {
    return null;
  }
}