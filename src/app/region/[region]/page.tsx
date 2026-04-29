import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRegions,
  getCountriesByRegion,
  formatPopulation,
  slugify,
} from "@/lib/countries";
import { CountryCard } from "@/components/country-card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ region: string }>;
}

export async function generateStaticParams() {
  const regions = await getRegions();
  return regions.map((r) => ({ region: slugify(r) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region } = await params;
  const regions = await getRegions();
  const regionName = regions.find((r) => slugify(r) === region);

  if (!regionName) return { title: "Region Not Found" };

  const countries = await getCountriesByRegion(region);

  return {
    title: `Countries in ${regionName} — ${countries.length} Nations`,
    description: `Explore all ${countries.length} countries in ${regionName}. Find population data, capitals, languages, and facts for every nation in the ${regionName} region.`,
    alternates: {
      canonical: `/region/${region}`,
    },
  };
}

export default async function RegionPage({ params }: PageProps) {
  const { region } = await params;
  const regions = await getRegions();
  const regionName = regions.find((r) => slugify(r) === region);

  if (!regionName) notFound();

  const countries = await getCountriesByRegion(region);
  const totalPopulation = countries.reduce((sum, c) => sum + c.population, 0);
  const totalArea = countries.reduce((sum, c) => sum + c.area, 0);

  const subregions = Array.from(
    new Set(countries.map((c) => c.subregion).filter(Boolean))
  ).sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Countries in ${regionName}`,
    description: `All ${countries.length} countries in the ${regionName} region.`,
    numberOfItems: countries.length,
    itemListElement: countries.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `/country/${c.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">{regionName}</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Countries in {regionName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explore all {countries.length} countries in {regionName} — with a
          combined population of {formatPopulation(totalPopulation)} across{" "}
          {new Intl.NumberFormat("en-US").format(totalArea)} km².
        </p>

        {/* Region navigation */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {regions.map((r) => (
            <Link key={r} href={`/region/${slugify(r)}`}>
              <Badge variant={r === regionName ? "default" : "outline"}>
                {r}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Sub-regions */}
        {subregions.length > 1 &&
          subregions.map((sub) => {
            const subCountries = countries.filter((c) => c.subregion === sub);
            return (
              <section key={sub} className="mt-10">
                <h2 className="font-heading text-xl font-semibold mb-4">
                  {sub}{" "}
                  <span className="text-muted-foreground font-normal text-base">
                    ({subCountries.length})
                  </span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subCountries.map((c) => (
                    <CountryCard key={c.slug} country={c} />
                  ))}
                </div>
              </section>
            );
          })}

        {subregions.length <= 1 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((c) => (
              <CountryCard key={c.slug} country={c} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
