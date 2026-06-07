import type { Metadata } from "next";
import { Module6Playground } from "@/components/module-6-playground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCountries } from "@/lib/countries";

interface PageProps {
  searchParams: Promise<{ tema?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { tema } = await searchParams;
  const topic = tema?.trim() || "estrategia-contenido-programatico";

  return {
    title: `Módulo 6 - ${topic} | ExploradorMundial`,
    description:
      "Clase 17: estrategia de contenido programático, evitar thin content, bloques dinámicos, contenido escalable, SEO semántico y conversión.",
    alternates: {
      canonical: "/modulo-6",
    },
  };
}

export default async function Modulo6Page() {
  const countries = await getAllCountries();
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
          Módulo 6: Estrategia de Contenido Programático
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Clase 17 del curso pSEO. Aprende a diseñar contenido que escala sin
          caer en thin content, usando bloques dinámicos, SEO semántico y CTAs
          orientados a conversión — con ejemplos reales de ExploradorMundial.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          "Estrategia de contenido",
          "Evitar thin content",
          "Bloques dinámicos",
          "Contenido escalable",
          "SEO semántico",
          "Orientado a conversión",
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

      <Module6Playground
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
