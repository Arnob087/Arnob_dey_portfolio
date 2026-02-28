"use client";

import React, { useEffect, useState } from "react";
import { PortfolioData } from "@/types";
import { INITIAL_DATA } from "@/lib/constants";
import { apiClient } from "@/services/apiClient";
import AdminDashboard from "@/components/AdminDashboard";

/**
 * Admin page — fully client-side (no SSR, no SEO needed).
 * Hidden from search engines via metadata in layout or robots.
 */
export default function AdminPage() {
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await apiClient.getData();
      if (result) setData(result);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading portfolio data…</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard data={data} onUpdate={setData} />;
}