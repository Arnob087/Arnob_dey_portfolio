import { PortfolioData } from "@/types";

export const INITIAL_DATA: PortfolioData = {
  name: "Your Name",
  heroSubtitle: "I build modern web experiences with clean code and thoughtful design. Let's create something amazing together.",
  tagline: "Full-Stack Developer & Creative Technologist",
  about: "Write your biography here. Describe your journey, skills, and professional values.",
  email: "your@email.com",
  profileImageUrl: "",
  resumeUrl: "",
  socials: {
    github: "",
    linkedin: "",
    instagram: "",
    facebook: "",
  },
  projects: [],
  blogs: [],
  experiences: [],
  skills: [],
  education: [],
  certifications: [],
  contactDetails: [
    { id: "cd-1", icon: "mail", label: "Email", value: "your@email.com" },
    { id: "cd-2", icon: "phone", label: "Phone", value: "+1 234 567 890" },
    { id: "cd-3", icon: "map-pin", label: "Location", value: "Your City" },
    { id: "cd-4", icon: "globe", label: "Website", value: "yoursite.com" },
  ],
};