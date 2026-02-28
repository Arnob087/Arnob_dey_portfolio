import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Chatbot from "@/components/Chatbot";
import { getPortfolioData } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: {
      default: `${data.name} — ${data.tagline}`,
      template: `%s | ${data.name}`,
    },
    description: data.about?.substring(0, 160),
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: `${data.name} — ${data.tagline}`,
      description: data.about?.substring(0, 160),
      url: siteUrl,
      siteName: data.name,
      type: "website",
      images: data.profileImageUrl
        ? [{ url: data.profileImageUrl, width: 800, height: 600 }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} — ${data.tagline}`,
      description: data.about?.substring(0, 160),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getPortfolioData();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-[#E4F5F5] from-[#E4F5F5] via-blue-50/30 to-indigo-50/20">
          <Navbar name={data.name} profileImageUrl={data.profileImageUrl} />
          <main>{children}</main>
          <Footer name={data.name} socials={data.socials} />
          <ScrollToTop />
          <Chatbot ownerName={data.name} />
        </div>
      </body>
    </html>
  );
}