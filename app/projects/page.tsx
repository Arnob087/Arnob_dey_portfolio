import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/data";
import ProjectsBlogs from "@/components/ProjectBlogs";

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  return {
    title: "Projects",
    description: `Explore projects, certifications, and writings by ${data.name}`,
  };
}

export default async function ProjectsPage() {
  const data = await getPortfolioData();
  return <ProjectsBlogs data={data} />;
}