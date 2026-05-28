import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegions } from "@/lib/countries";
import {
  GROUP_LABELS,
  GROUP_TYPE_PLURAL,
  isGroupType,
} from "@/lib/seo";
import { regionCategoryHubPath } from "@/lib/paths";

interface PageProps {
  params: Promise<{ tipo: string }>;
}

export async function generateStaticParams() {
  const { GROUP_TYPES } = await import("@/lib/paths");
  return GROUP_TYPES.map((tipo) => ({ tipo }));
}

export const metadata: Metadata = {
  title: "Selecciona una región",
  robots: { index: false, follow: true },
};

export default async function LegacyPaisesTipoPage({ params }: PageProps) {
  const { tipo } = await params;
  if (!isGroupType(tipo)) notFound();

  const regions = await getRegions();
  const plural = GROUP_TYPE_PLURAL[tipo];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">
        {plural} por región
      </h1>
      <p className="mt-2 text-muted-foreground">
        Las URLs de categoría ahora viven bajo cada región, por ejemplo{" "}
        <code className="text-sm">/region/europe/{tipo}/…</code>
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {regions.map((region) => (
          <li key={region}>
            <Link
              href={regionCategoryHubPath(region, tipo)}
              className="block rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted/50"
            >
              {GROUP_LABELS[tipo]} en {region}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
