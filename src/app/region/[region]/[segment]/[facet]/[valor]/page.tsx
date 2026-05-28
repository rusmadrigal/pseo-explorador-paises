import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  countryMatchesFacet,
  getAllCountries,
  getCountriesByGroupInRegion,
  getCountryBySlug,
  getCountryFacets,
  slugify,
} from "@/lib/countries";
import type { CountryGroupType } from "@/lib/countries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import {
  GROUP_LABELS,
  buildCountryFacetBreadcrumbs,
  getCountryFacetIntro,
  isGroupType,
} from "@/lib/seo";
import {
  countryFacetPath,
  countryPath,
  regionCategoryPath,
} from "@/lib/paths";

interface PageProps {
  params: Promise<{
    region: string;
    segment: string;
    facet: string;
    valor: string;
  }>;
}

/** Atributo de país: /region/oceania/australia/moneda/australian-dollar */
export async function generateStaticParams() {
  const countries = await getAllCountries();
  return countries.flatMap((country) =>
    getCountryFacets(country).map((f) => ({
      region: slugify(country.region),
      segment: country.slug,
      facet: f.tipo,
      valor: slugify(f.value),
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, segment, facet, valor } = await params;
  if (isGroupType(segment) || !isGroupType(facet)) {
    return { title: "No encontrado" };
  }

  const country = await getCountryBySlug(segment);
  if (!country || slugify(country.region) !== region) {
    return { title: "No encontrado" };
  }

  const groupResult = await getCountriesByGroupInRegion(
    region,
    facet as CountryGroupType,
    valor
  );
  if (!groupResult || !countryMatchesFacet(country, facet as CountryGroupType, groupResult.value)) {
    return { title: "No encontrado" };
  }

  const label = GROUP_LABELS[facet as CountryGroupType];
  const canonical = countryFacetPath(country, facet as CountryGroupType, groupResult.value);

  return {
    title: `${country.name} — ${label}: ${groupResult.value}`,
    description: getCountryFacetIntro(country, facet as CountryGroupType, groupResult.value),
    alternates: { canonical },
  };
}

export default async function CountryFacetPage({ params }: PageProps) {
  const { region, segment, facet, valor } = await params;
  if (isGroupType(segment) || !isGroupType(facet)) notFound();

  const tipo = facet as CountryGroupType;
  const country = await getCountryBySlug(segment);
  if (!country || slugify(country.region) !== region) notFound();

  const groupResult = await getCountriesByGroupInRegion(region, tipo, valor);
  if (!groupResult || !countryMatchesFacet(country, tipo, groupResult.value)) {
    notFound();
  }

  const { value, countries, regionName } = groupResult;
  const label = GROUP_LABELS[tipo];
  const intro = getCountryFacetIntro(country, tipo, value);
  const relatedInRegion = countries.filter((c) => c.slug !== country.slug);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Breadcrumbs items={buildCountryFacetBreadcrumbs(country, tipo, value)} />

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label} en {country.name}
      </p>
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {country.name}: {value}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={countryPath(country)}>
          <Badge variant="secondary">Perfil de {country.name}</Badge>
        </Link>
        <Link href={regionCategoryPath(regionName, tipo, value)}>
          <Badge variant="outline">
            Ver todos en {regionName} ({relatedInRegion.length + 1})
          </Badge>
        </Link>
      </div>

      {relatedInRegion.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold mb-3">
            Otros países en {regionName} con {label} «{value}»
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {relatedInRegion.map((c) => (
              <li key={c.slug}>
                <Link
                  href={countryFacetPath(c, tipo, value)}
                  className="text-sm underline underline-offset-2"
                >
                  {c.flag} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
