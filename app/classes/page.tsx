import { fetchCRCsServer } from "@/lib/crcs";
import { ClassesPageClient } from "@/components/classes/classes-page-client";

export default async function ClassesPage() {
  const crcs = await fetchCRCsServer();

  return <ClassesPageClient crcs={crcs} />;
}
