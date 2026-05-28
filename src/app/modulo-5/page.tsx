import type { Metadata } from "next";
import { Module5Playground } from "@/components/module-5-playground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCountries } from "@/lib/countries";

interface PageProps {
  searchParams: Promise<{ tema?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { tema } = await searchParams;
  const topic = tema?.trim() || "templates-escalables";

  return {
    title: `Modulo 5 - ${topic} | ExploradorMundial`,
    description:
      "Ejemplos interactivos del Modulo 5: template reutilizable, metadata dinamica, schema dinamico, layout escalable y componentes reutilizables.",
    alternates: {
      canonical: "/modulo-5",
    },
  };
}

export default async function Modulo5Page() {
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
          Modulo 5: Templates Escalables
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Clase interactiva para entender, con casos reales del proyecto, como
          escalar una arquitectura pSEO con templates, metadata, schema, layout
          y componentes reutilizables.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          "Template reutilizable",
          "Metadata dinamica",
          "Schema dinamico",
          "Layout escalable",
          "Componentes reutilizables",
        ].map((topic) => (
          <Card key={topic} size="sm">
            <CardHeader>
              <CardTitle className="text-sm">{topic}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Explicacion + actividad rapida.
            </CardContent>
          </Card>
        ))}
      </div>

      <Module5Playground
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
        }))}
      />
    </main>
  );
}
