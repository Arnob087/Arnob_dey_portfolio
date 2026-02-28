export interface Socials {
  github: string;
  linkedin: string;
  instagram: string;
  facebook: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  videoUrl: string;
  category: "web" | "mobile" | "ai";
  featured: boolean;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  link: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  docUrl: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  achievements: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
  link: string;
}

export interface ContactDetail {
  id: string;
  icon: "mail" | "phone" | "map-pin" | "globe";
  label: string;
  value: string;
}

export interface PortfolioData {
  name: string;
  tagline: string;
  heroSubtitle?: string;
  about: string;
  email: string;
  profileImageUrl: string;
  resumeUrl?: string;
  resumeFilename?: string;  // ← NEW: custom download filename
  socials: Socials;
  projects: Project[];
  blogs: Blog[];
  experiences: Experience[];
  skills: Skill[];
  education: Education[];
  certifications: Certification[];
  contactDetails: ContactDetail[];
}