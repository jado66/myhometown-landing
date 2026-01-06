import { getAllCRCSlugs } from "@/lib/crcs";

// Generate static paths for all CRCs
export async function generateStaticParams() {
  try {
    const slugs = await getAllCRCSlugs();

    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
