import { Metadata } from "next";
import Link from "next/link";
import { CountryCard } from "@/components/country-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { formatPopulation, getCountriesByRegion } from "@/lib/countries";
import { buildSouthAmericaBreadcrumbs } from "@/lib/seo";
import { regionCategoryPath, southAmericaLandingPath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Países de Sudamérica — Capital, Población y Datos",
  description:
    "Explora todos los países de Sudamérica con sus capitales, población y datos clave.",
  alternates: {
    canonical: southAmericaLandingPath(),
  },
};

export default async function SouthAmericaPage() {
  const americasCountries = await getCountriesByRegion("americas");
  const countries = americasCountries.filter(
    (country) => country.subregion === "South America"
  );
  const totalPopulation = countries.reduce(
    (sum, country) => sum + country.population,
    0
  );

  const intro = `Sudamérica reúne ${countries.length} países con ${formatPopulation(totalPopulation)} de población combinada dentro del hub Americas.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Países de Sudamérica",
    description: intro,
    numberOfItems: countries.length,
    itemListElement: countries.map((country, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: country.name,
      url: `/region/americas/${country.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Breadcrumbs items={buildSouthAmericaBreadcrumbs()} />

        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Países de Sudamérica
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/region/americas">
            <Badge variant="secondary">Hub: Americas</Badge>
          </Link>
          <Link
            href={regionCategoryPath("Americas", "subregion", "South America")}
          >
            <Badge variant="outline">Categoría: South America</Badge>
          </Link>
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
