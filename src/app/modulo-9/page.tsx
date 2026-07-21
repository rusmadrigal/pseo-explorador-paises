import type { Metadata } from "next";
import { Module9Playground } from "@/components/module-9-playground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCountries, getRegions } from "@/lib/countries";

interface PageProps {
  searchParams: Promise<{ tema?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { tema } = await searchParams;
  const topic = tema?.trim() || "de-build-a-trafico";

  return {
    title: `Módulo 9 - ${topic} | ExploradorMundial`,
    description:
      "Cierre del curso pSEO: go-live en Vercel, medición en Search Console y proyecto final para llevar tu propio sistema de SEO programático a tráfico real.",
    alternates: {
      canonical: "/modulo-9",
    },
  };
}

export default async function Modulo9Page() {
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
          Módulo 9: De Build a Tráfico Real
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Clase 21 y cierre del curso pSEO. Publica ExploradorMundial, mide
          resultados en Search Console y define tu proyecto final: el mismo
          pipeline aplicado a tu nicho con 10–20 URLs.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {["Go-live", "Medición", "Cierre del curso"].map((topic) => (
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

      <Module9Playground
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
