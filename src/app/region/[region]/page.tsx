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
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { buildRegionBreadcrumbs, getRegionIntro } from "@/lib/seo";

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

  if (!regionName) return { title: "Región No Encontrada" };

  const countries = await getCountriesByRegion(region);

  return {
    title: `Países en ${regionName} — ${countries.length} Naciones`,
    description: `Explora los ${countries.length} países de ${regionName}. Datos de población, capitales, idiomas y datos de cada nación en la región de ${regionName}.`,
    alternates: {
      canonical: `/region/${region}`,
    },
    openGraph: {
      title: `Países en ${regionName}`,
      description: `Hub regional con ${countries.length} países en ${regionName}.`,
      type: "website",
      url: `/region/${region}`,
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

  const continents = Array.from(
    new Set(countries.map((c) => c.continent).filter(Boolean))
  ).sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Países en ${regionName}`,
    description: getRegionIntro(regionName, countries.length, totalPopulation, totalArea),
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
        <Breadcrumbs items={buildRegionBreadcrumbs(regionName)} />

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Hub regional
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Países en {regionName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {getRegionIntro(regionName, countries.length, totalPopulation, totalArea)}
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

        {/* Related categories */}
        <section className="mt-8 rounded-lg border bg-muted/30 p-4">
          <h2 className="font-heading text-sm font-semibold">
            Explorar por categoría
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrupaciones programáticas relacionadas con esta región.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/paises/subregion">
              <Badge variant="secondary">Subregiones</Badge>
            </Link>
            <Link href="/paises/continente">
              <Badge variant="secondary">Continentes</Badge>
            </Link>
            <Link href="/paises/idioma">
              <Badge variant="secondary">Idiomas</Badge>
            </Link>
            {continents.map((continent) => (
              <Link
                key={continent}
                href={`/paises/continente/${slugify(continent)}`}
              >
                <Badge variant="outline">{continent}</Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* Sub-regions → category pages */}
        {subregions.length > 1 ? (
          subregions.map((sub) => {
            const subCountries = countries.filter((c) => c.subregion === sub);
            const isSouthAmerica =
              region === "americas" && sub === "South America";
            const subHref = `/paises/subregion/${slugify(sub)}`;

            return (
              <section key={sub} className="mt-10">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-heading text-xl font-semibold">
                    <Link
                      href={isSouthAmerica ? "/paises/sudamerica" : subHref}
                      className="hover:underline underline-offset-4"
                    >
                      {isSouthAmerica ? "Sudamérica" : sub}
                    </Link>
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      ({subCountries.length} países)
                    </span>
                  </h2>
                  <Link
                    href={subHref}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Ver categoría &rarr;
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subCountries.map((c) => (
                    <CountryCard key={c.slug} country={c} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
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
