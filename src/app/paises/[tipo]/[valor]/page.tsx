import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CountryCard } from "@/components/country-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import {
  CountryGroupType,
  formatPopulation,
  getCountriesByGroup,
  getGroupValues,
  slugify,
} from "@/lib/countries";
import {
  GROUP_LABELS,
  GROUP_TYPE_PLURAL,
  buildCategoryBreadcrumbs,
  getCategoryIntro,
  getPrimaryRegion,
  isGroupType,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ tipo: string; valor: string }>;
}

const GROUP_TYPES = Object.keys(GROUP_LABELS) as CountryGroupType[];

export async function generateStaticParams() {
  const params = await Promise.all(
    GROUP_TYPES.map(async (tipo) => {
      const values = await getGroupValues(tipo);
      return values.map((valor) => ({
        tipo,
        valor: slugify(valor),
      }));
    })
  );

  return params.flat();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tipo, valor } = await params;
  if (!isGroupType(tipo)) return { title: "Categoría No Encontrada" };

  const groupResult = await getCountriesByGroup(tipo, valor);
  if (!groupResult) return { title: "Categoría No Encontrada" };

  const { value, countries } = groupResult;
  const groupLabel = GROUP_LABELS[tipo];
  const description = getCategoryIntro(tipo, value, countries.length, countries.reduce((s, c) => s + c.population, 0));

  return {
    title: `Países por ${groupLabel}: ${value}`,
    description,
    alternates: {
      canonical: `/paises/${tipo}/${valor}`,
    },
    openGraph: {
      title: `Países por ${groupLabel}: ${value}`,
      description,
      type: "website",
      url: `/paises/${tipo}/${valor}`,
    },
  };
}

export default async function CountriesByGroupPage({ params }: PageProps) {
  const { tipo, valor } = await params;
  if (!isGroupType(tipo)) notFound();

  const groupResult = await getCountriesByGroup(tipo, valor);
  if (!groupResult) notFound();

  const { value, countries } = groupResult;
  const groupLabel = GROUP_LABELS[tipo];
  const totalPopulation = countries.reduce((sum, country) => sum + country.population, 0);
  const primaryRegion = getPrimaryRegion(countries);
  const intro = getCategoryIntro(tipo, value, countries.length, totalPopulation);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Países por ${groupLabel}: ${value}`,
    description: intro,
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
        <Breadcrumbs items={buildCategoryBreadcrumbs(tipo, value, countries)} />

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Página de categoría
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Países por {groupLabel}: {value}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/paises/${tipo}`}>
            <Badge variant="secondary">Ver todas las {GROUP_TYPE_PLURAL[tipo]}</Badge>
          </Link>
          {primaryRegion && (
            <Link href={`/region/${slugify(primaryRegion)}`}>
              <Badge variant="outline">Hub: {primaryRegion}</Badge>
            </Link>
          )}
          {tipo === "subregion" && value === "South America" && (
            <Link href="/paises/sudamerica">
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
