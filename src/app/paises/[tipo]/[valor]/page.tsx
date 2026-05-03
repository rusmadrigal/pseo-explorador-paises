import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CountryCard } from "@/components/country-card";
import {
  CountryGroupType,
  formatPopulation,
  getCountriesByGroup,
  getGroupValues,
  slugify,
} from "@/lib/countries";

interface PageProps {
  params: Promise<{ tipo: string; valor: string }>;
}

const GROUP_LABELS: Record<CountryGroupType, string> = {
  idioma: "idioma",
  moneda: "moneda",
  subregion: "subregión",
  continente: "continente",
  "zona-horaria": "zona horaria",
};

function isGroupType(value: string): value is CountryGroupType {
  return value in GROUP_LABELS;
}

export async function generateStaticParams() {
  const groupTypes = Object.keys(GROUP_LABELS) as CountryGroupType[];
  const params = await Promise.all(
    groupTypes.map(async (tipo) => {
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
  const description = `Explora ${countries.length} países agrupados por ${groupLabel}: ${value}.`;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Países por ${groupLabel}: ${value}`,
    description: `Listado de ${countries.length} países agrupados por ${groupLabel}: ${value}.`,
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
          <span className="text-foreground">Países por {groupLabel}</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Países por {groupLabel}: {value}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Hay {countries.length} países en esta agrupación, con una población total de{" "}
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
