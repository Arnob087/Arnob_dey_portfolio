import { getPortfolioData } from "@/lib/data";
import HomeComponent from "@/components/HomeComponent";

// Static Generation — rebuilds when revalidated via /api/revalidate
export const revalidate = false; // fully static until on-demand revalidation

export default async function HomePage() {
  const data = await getPortfolioData();
  return <HomeComponent data={data} />;
}