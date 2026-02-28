import { PortfolioData } from "@/types";

export const apiClient = {
  login: async (
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include", // Important: sends/receives cookies
      });
      return await res.json();
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetch("/api/auth/admin", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Silently fail — just clear client state
    }
  },

  getData: async (): Promise<PortfolioData | null> => {
    try {
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  updateData: async (data: PortfolioData): Promise<boolean> => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await res.json();
      return json.success;
    } catch {
      return false;
    }
  },

  uploadImage: async (file: File, filename?: string): Promise<string | null> => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          filename: filename || file.name.replace(/\.[^/.]+$/, ""), // strip extension
        }),
        credentials: "include",
      });

      const json = await res.json();
      return json.success ? json.url : null;
    } catch {
      return null;
    }
  },

  sendEmail: async (
    data: { name: string; email: string; message: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  },

  revalidatePages: async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/revalidate-internal", {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      return json.success;
    } catch {
      return false;
    }
  },

  chat: async (
    message: string
  ): Promise<{ reply: string; loading?: boolean }> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      return { reply: json.reply, loading: json.loading };
    } catch {
      return { reply: "Network error. Please check your connection." };
    }
  },
};