import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCountriesByGroupInRegion,
  getRegions,
  slugify,
} from "@/lib/countries";
import { CountryCard } from "@/components/country-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import {
  GROUP_LABELS,
  GROUP_TYPE_PLURAL,
  buildRegionCategoryBreadcrumbs,
  getCategoryIntro,
  isGroupType,
} from "@/lib/seo";
import {
  GROUP_TYPES,
  regionCategoryHubPath,
  southAmericaLandingPath,
} from "@/lib/paths";

interface PageProps {
  params: Promise<{ region: string; segment: string; facet: string }>;
}

/** Categoría regional: /region/oceania/idioma/english */
export async function generateStaticParams() {
  const regions = await getRegions();
  const { getGroupValuesInRegion } = await import("@/lib/countries");
  const allParams: { region: string; segment: string; facet: string }[] = [];

  for (const regionName of regions) {
    const regionSlug = slugify(regionName);
    for (const tipo of GROUP_TYPES) {
      const values = await getGroupValuesInRegion(regionSlug, tipo);
      for (const value of values) {
        allParams.push({
          region: regionSlug,
          segment: tipo,
          facet: slugify(value),
        });
      }
    }
  }

  return allParams;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, segment, facet } = await params;
  if (!isGroupType(segment)) return { title: "No encontrado" };

  const groupResult = await getCountriesByGroupInRegion(region, segment, facet);
  if (!groupResult) return { title: "No encontrado" };

  const { value, countries, regionName } = groupResult;
  const description = getCategoryIntro(
    segment,
    value,
    countries.length,
    countries.reduce((s, c) => s + c.population, 0),
    regionName
  );

  return {
    title: `${GROUP_LABELS[segment]}: ${value} en ${regionName}`,
    description,
    alternates: {
      canonical: `/region/${region}/${segment}/${facet}`,
    },
  };
}

export default async function RegionCategoryPage({ params }: PageProps) {
  const { region, segment, facet } = await params;
  if (!isGroupType(segment)) notFound();

  const groupResult = await getCountriesByGroupInRegion(region, segment, facet);
  if (!groupResult) notFound();

  const { value, countries, regionName } = groupResult;
  const totalPopulation = countries.reduce((sum, c) => sum + c.population, 0);
  const intro = getCategoryIntro(
    segment,
    value,
    countries.length,
    totalPopulation,
    regionName
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${GROUP_LABELS[segment]}: ${value} en ${regionName}`,
    description: intro,
    numberOfItems: countries.length,
    itemListElement: countries.map((country, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: country.name,
      url: `/region/${region}/${country.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Breadcrumbs
          items={buildRegionCategoryBreadcrumbs(regionName, segment, value)}
        />

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Categoría en {regionName}
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {GROUP_LABELS[segment]}: {value}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={regionCategoryHubPath(regionName, segment)}>
            <Badge variant="secondary">
              Todas las {GROUP_TYPE_PLURAL[segment]}
            </Badge>
          </Link>
          {segment === "subregion" &&
            value === "South America" &&
            region === "americas" && (
              <Link href={southAmericaLandingPath()}>
                <Badge variant="outline">Landing Sudamérica</Badge>
              </Link>
            )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      </main>
    </>
  );
}
