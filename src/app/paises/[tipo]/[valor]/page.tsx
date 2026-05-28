import { notFound, permanentRedirect } from "next/navigation";
import { getCountriesByGroup } from "@/lib/countries";
import { getPrimaryRegion, isGroupType } from "@/lib/seo";
import { regionCategoryPath } from "@/lib/paths";

interface PageProps {
  params: Promise<{ tipo: string; valor: string }>;
}

export default async function LegacyPaisesCategoryRedirect({ params }: PageProps) {
  const { tipo, valor } = await params;
  if (!isGroupType(tipo)) notFound();

  const groupResult = await getCountriesByGroup(tipo, valor);
  if (!groupResult) notFound();

  const primaryRegion = getPrimaryRegion(groupResult.countries);
  if (!primaryRegion) notFound();

  permanentRedirect(
    regionCategoryPath(primaryRegion, tipo, groupResult.value)
  );
}
