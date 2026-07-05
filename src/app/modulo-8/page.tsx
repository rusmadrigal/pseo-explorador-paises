import type { Metadata } from "next";
import { Module8Playground } from "@/components/module-8-playground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCountries, getRegions } from "@/lib/countries";

interface PageProps {
  searchParams: Promise<{ tema?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { tema } = await searchParams;
  const topic = tema?.trim() || "technical-seo-pseo";

  return {
    title: `Módulo 8 - ${topic} | ExploradorMundial`,
    description:
      "Technical SEO para pSEO: indexación, crawl budget, sitemap dinámico, canonicals, pagination y faceted navigation en ExploradorMundial.",
    alternates: {
      canonical: "/modulo-8",
    },
  };
}

export default async function Modulo8Page() {
  const countries = await getAllCountries();
  const regions = await getRegions();
  const usa = countries.find(
    (country) =>
      country.slug === "united-states" ||
      country.name === "United States" ||
      country.name.includes("United States")
  );
  const sampleCountries = [
    ...(usa ? [usa] : []),
    ...countries
      .filter((country) => country.slug !== "united-states")
      .slice(0, 39),
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Módulo 8: Technical SEO para Programmatic SEO
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Clase 20 del curso pSEO. Aprende a hacer que Google descubra, rastree e
          indexe cientos de URLs sin desperdiciar crawl budget: sitemap
          dinámico, canonicals, paginación y control de navegación facetada en
          ExploradorMundial.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          "Indexación",
          "Crawl budget",
          "Sitemap dinámico",
          "Canonicals",
          "Pagination",
          "Faceted navigation",
        ].map((topic) => (
          <Card key={topic} size="sm">
            <CardHeader>
              <CardTitle className="text-sm">{topic}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Explicación + actividad rápida.
            </CardContent>
          </Card>
        ))}
      </div>

      <Module8Playground
        totalCountryCount={countries.length}
        regionCount={regions.length}
        countries={sampleCountries.map((country) => ({
          name: country.name,
          slug: country.slug,
          region: country.region,
          subregion: country.subregion,
          population: country.population,
          capital: country.capital,
          continent: country.continent,
          languages: country.languages,
          currencies: country.currencies,
          timezones: country.timezones,
          area: country.area,
        }))}
      />
    </main>
  );
}
