import { getDb, COLLECTION_NAME, DOC_ID } from "./mongodb";
import { INITIAL_DATA } from "./constants";
import { PortfolioData } from "@/types";

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);
    const document = await collection.findOne({ doc_id: DOC_ID });

    if (document) {
      const { _id, doc_id, updatedAt, ...cleanData } = document;
      const parsed = JSON.parse(JSON.stringify(cleanData));

      return {
        name: parsed.name || INITIAL_DATA.name,
        tagline: parsed.tagline || INITIAL_DATA.tagline,
        heroSubtitle: parsed.heroSubtitle || INITIAL_DATA.heroSubtitle,  // ← NEW
        about: parsed.about || INITIAL_DATA.about,
        email: parsed.email || INITIAL_DATA.email,
        profileImageUrl: parsed.profileImageUrl || "",
        resumeUrl: parsed.resumeUrl || "",
        socials: {
          github: parsed.socials?.github || "",
          linkedin: parsed.socials?.linkedin || "",
          instagram: parsed.socials?.instagram || "",
          facebook: parsed.socials?.facebook || "",
        },
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        blogs: Array.isArray(parsed.blogs) ? parsed.blogs : [],
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        contactDetails: Array.isArray(parsed.contactDetails) && parsed.contactDetails.length > 0
          ? parsed.contactDetails
          : INITIAL_DATA.contactDetails,
      };
    }

    return INITIAL_DATA;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return INITIAL_DATA;
  }
}