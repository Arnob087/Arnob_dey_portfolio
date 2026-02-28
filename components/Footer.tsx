import React from "react";
import { Github, Linkedin, Instagram, Facebook, Heart } from "lucide-react";
import { Socials } from "@/types";

interface FooterProps {
  name: string;
  socials?: Socials;
}

const Footer: React.FC<FooterProps> = ({ name, socials }) => {
  const socialLinks = [
    { key: "github", url: socials?.github, Icon: Github, label: "GitHub" },
    { key: "linkedin", url: socials?.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { key: "instagram", url: socials?.instagram, Icon: Instagram, label: "Instagram" },
    { key: "facebook", url: socials?.facebook, Icon: Facebook, label: "Facebook" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-slate-900 text-white py-12 mt-20 ">
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="flex flex-row md:flex-col  items-center gap-6 ">
          <div>
            <p className="font-serif text-lg font-bold text-center">{name}</p>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              Made by himself <Heart size={14} className="text-red-400 fill-red-400" /> &copy;{" "}
              {new Date().getFullYear()}
            </p>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map(({ key, url, Icon, label }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors p-2"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;