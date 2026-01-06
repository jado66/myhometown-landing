import { fetchCRCBySlugServer, getAllCRCSlugs } from "@/lib/crcs";
import { ClassesPageForCRC } from "@/components/classes/classes-page-for-crc";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

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

export default async function ClassesForCRCPage({ params }: Props) {
  const crc = await fetchCRCBySlugServer(params.slug);

  if (!crc) {
    notFound();
  }

  return <ClassesPageForCRC crc={crc} />;
}