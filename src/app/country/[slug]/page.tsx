import { notFound, permanentRedirect } from "next/navigation";
import { getCountryBySlug, slugify } from "@/lib/countries";
import { countryPath } from "@/lib/paths";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyCountryRedirect({ params }: PageProps) {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);
  if (!country) notFound();
  permanentRedirect(countryPath(country));
}
