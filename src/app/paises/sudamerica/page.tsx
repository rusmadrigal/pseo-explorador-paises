import { Metadata } from "next";
import Link from "next/link";
import { CountryCard } from "@/components/country-card";
import { formatPopulation, getCountriesByRegion } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Países de Sudamérica — Capital, Población y Datos",
  description:
    "Explora todos los países de Sudamérica con sus capitales, población y datos clave. Landing SEO programática para la subregión sudamericana.",
  alternates: {
    canonical: "/paises/sudamerica",
  },
  openGraph: {
    title: "Países de Sudamérica — Capital, Población y Datos",
    description:
      "Listado de países de Sudamérica con información clave de cada nación en un solo lugar.",
    type: "website",
    url: "/paises/sudamerica",
  },
};

export default async function SouthAmericaPage() {
  const americasCountries = await getCountriesByRegion("americas");
  const countries = americasCountries.filter((country) => country.subregion === "South America");
  const totalPopulation = countries.reduce((sum, country) => sum + country.population, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Países de Sudamérica",
    description: `Listado de ${countries.length} países de la subregión de Sudamérica.`,
    numberOfItems: countries.length,
    itemListElement: countries.map((country, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: country.name,
      url: `/country/${country.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/region/americas" className="hover:text-foreground transition-colors">
            Americas
          </Link>
          <span>/</span>
          <span className="text-foreground">Sudamérica</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Países de Sudamérica
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explora los {countries.length} países de Sudamérica, con una población combinada de{" "}
          {formatPopulation(totalPopulation)}.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      </main>
    </>
  );
}
