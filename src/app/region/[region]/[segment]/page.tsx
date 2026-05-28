import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import {
  getAllCountries,
  getCountryBySlug,
  getGroupValuesInRegion,
  getRegionBySlug,
  slugify,
} from "@/lib/countries";
import { CountryDetail } from "@/components/country-detail";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import {
  GROUP_LABELS,
  GROUP_TYPE_PLURAL,
  buildRegionBreadcrumbs,
  getCountryIntro,
  isGroupType,
} from "@/lib/seo";
import {
  GROUP_TYPES,
  countryPath,
  regionCategoryPath,
  regionPath,
} from "@/lib/paths";

interface PageProps {
  params: Promise<{ region: string; segment: string }>;
}

export async function generateStaticParams() {
  const { getRegions } = await import("@/lib/countries");
  const countries = await getAllCountries();
  const regions = await getRegions();

  const countryParams = countries.map((c) => ({
    region: slugify(c.region),
    segment: c.slug,
  }));

  const categoryHubParams = regions.flatMap((regionName) =>
    GROUP_TYPES.map((tipo) => ({
      region: slugify(regionName),
      segment: tipo,
    }))
  );

  return [...countryParams, ...categoryHubParams];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, segment } = await params;

  if (isGroupType(segment)) {
    const regionName = await getRegionBySlug(region);
    if (!regionName) return { title: "No encontrado" };
    return {
      title: `${GROUP_TYPE_PLURAL[segment]} en ${regionName}`,
      alternates: { canonical: `${regionPath(regionName)}/${segment}` },
    };
  }

  const country = await getCountryBySlug(segment);
  if (!country || slugify(country.region) !== region) {
    return { title: "País No Encontrado" };
  }

  const description = getCountryIntro(country);
  return {
    title: `${country.name} — Perfil del País y Datos`,
    description,
    alternates: { canonical: countryPath(country) },
  };
}

export default async function RegionSegmentPage({ params }: PageProps) {
  const { region, segment } = await params;

  if (isGroupType(segment)) {
    const regionName = await getRegionBySlug(region);
    if (!regionName) notFound();

    const values = await getGroupValuesInRegion(region, segment);
    const label = GROUP_LABELS[segment];
    const plural = GROUP_TYPE_PLURAL[segment];

    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Breadcrumbs
          items={[
            ...buildRegionBreadcrumbs(regionName).slice(0, -1),
            { label: regionName, href: regionPath(regionName) },
            { label: plural },
          ]}
        />

        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {plural} en {regionName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {values.length} categorías de {label} en esta región.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {GROUP_TYPES.filter((t) => t !== segment).map((other) => (
            <Link key={other} href={`${regionPath(regionName)}/${other}`}>
              <Badge variant="outline">{GROUP_TYPE_PLURAL[other]}</Badge>
            </Link>
          ))}
        </div>

        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <li key={value}>
              <Link
                href={regionCategoryPath(regionName, segment, value)}
                className="block rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                {value}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const country = await getCountryBySlug(segment);
  if (!country) notFound();

  if (slugify(country.region) !== region) {
    permanentRedirect(countryPath(country));
  }

  return <CountryDetail country={country} regionSlug={region} />;
}
