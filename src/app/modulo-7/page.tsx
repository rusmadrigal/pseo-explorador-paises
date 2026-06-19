import type { Metadata } from "next";
import { Module7Playground } from "@/components/module-7-playground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCountries } from "@/lib/countries";

interface PageProps {
  searchParams: Promise<{ tema?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { tema } = await searchParams;
  const topic = tema?.trim() || "generacion-contenido-ia";

  return {
    title: `Módulo 7 - ${topic} | ExploradorMundial`,
    description:
      "Generación de contenido con IA para pSEO: prompts escalables, evitar duplicación y QA manual. Los bloques dinámicos se cubren en el Módulo 6.",
    alternates: {
      canonical: "/modulo-7",
    },
  };
}

export default async function Modulo7Page() {
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
          Módulo 7: Generación de Contenido con IA
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Aprende a integrar IA en un pipeline pSEO: prompts que escalan, control
          de duplicación y QA manual antes de publicar. Los content blocks
          dinámicos ya se estudiaron en el Módulo 6 — aquí la IA alimenta esos
          bloques.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          "IA para pSEO",
          "Prompts escalables",
          "Evitar duplicación",
          "QA manual",
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

      <Module7Playground
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
