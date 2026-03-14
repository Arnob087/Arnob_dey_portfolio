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
    keywords: [data.name, "Portfolio", "Full Stack Developer", "Software Engineer", "Web Development", "Bangladesh Developer"],
    authors: [{ name: data.name }],
    creator: data.name,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${data.name} — ${data.tagline}`,
      description: data.about?.substring(0, 160),
      url: siteUrl,
      siteName: data.name,
      locale: "en_US",
      type: "website",
      images: data.profileImageUrl
        ? [{ url: data.profileImageUrl, width: 1200, height: 630, alt: data.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} — ${data.tagline}`,
      description: data.about?.substring(0, 160),
      creator: "@arnob",
      images: data.profileImageUrl ? [data.profileImageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: data.name,
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              image: data.profileImageUrl,
              jobTitle: "Software Engineer",
              description: data.about?.substring(0, 160),
              sameAs: Object.values(data.socials || {}).filter(Boolean),
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-[#E4F5F5] from-[#E4F5F5] via-blue-50/30 to-indigo-50/20">
          <Navbar name={data.name} profileImageUrl={data.profileImageUrl} socials={data.socials} />
          <main>{children}</main>
          <Footer name={data.name} socials={data.socials} />
          <ScrollToTop />
          <Chatbot ownerName={data.name} />
        </div>
      </body>
    </html>
  );
}