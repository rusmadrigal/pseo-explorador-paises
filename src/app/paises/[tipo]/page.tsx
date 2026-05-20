import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import {
  CountryGroupType,
  getGroupValues,
  slugify,
} from "@/lib/countries";
import {
  GROUP_LABELS,
  GROUP_TYPE_PLURAL,
  isGroupType,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ tipo: string }>;
}

const GROUP_TYPES = Object.keys(GROUP_LABELS) as CountryGroupType[];

export async function generateStaticParams() {
  return GROUP_TYPES.map((tipo) => ({ tipo }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tipo } = await params;
  if (!isGroupType(tipo)) return { title: "Categoría No Encontrada" };

  const label = GROUP_LABELS[tipo];
  return {
    title: `Países por ${label} — Todas las categorías`,
    description: `Explora países agrupados por ${label}. Índice de categorías programáticas de WorldExplorer.`,
    alternates: {
      canonical: `/paises/${tipo}`,
    },
  };
}

export default async function CategoryTypeHubPage({ params }: PageProps) {
  const { tipo } = await params;
  if (!isGroupType(tipo)) notFound();

  const values = await getGroupValues(tipo);
  const label = GROUP_LABELS[tipo];
  const plural = GROUP_TYPE_PLURAL[tipo];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: `Países por ${label}` },
        ]}
      />

      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Países por {label}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Índice de {values.length} {plural} generadas automáticamente. Cada enlace
        lleva a una página de categoría con todos los países que comparten ese
        criterio.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {GROUP_TYPES.filter((t) => t !== tipo).map((other) => (
          <Link key={other} href={`/paises/${other}`}>
            <Badge variant="outline">{GROUP_LABELS[other]}</Badge>
          </Link>
        ))}
      </div>

      <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <li key={value}>
            <Link
              href={`/paises/${tipo}/${slugify(value)}`}
              className="block rounded-lg border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              {value}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
