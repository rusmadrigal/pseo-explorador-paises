import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import {
  getAllCountries,
  getCountryBySlug,
  getBorderCountries,
  formatPopulation,
  formatArea,
  slugify,
} from "@/lib/countries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CountryCard } from "@/components/country-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const countries = await getAllCountries();
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);
  if (!country) return { title: "País No Encontrado" };

  const description = `Descubre ${country.name} — capital: ${country.capital}, población: ${formatPopulation(country.population)}, región: ${country.region}. Idiomas, monedas, geografía y más.`;

  return {
    title: `${country.name} — Perfil del País y Datos`,
    description,
    openGraph: {
      title: `${country.name} — Perfil del País y Datos`,
      description,
      type: "article",
    },
    alternates: {
      canonical: `/country/${country.slug}`,
    },
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);
  if (!country) notFound();

  const borderCountries = await getBorderCountries(country);
  const allCountries = await getAllCountries();
  const regionCountries = allCountries
    .filter((c) => c.region === country.region && c.slug !== country.slug)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Country",
    name: country.name,
    alternateName: country.officialName,
    description: `${country.name} es un país en ${country.region} con una población de ${formatPopulation(country.population)}.`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: country.latlng[0],
      longitude: country.latlng[1],
    },
    containedInPlace: {
      "@type": "Continent",
      name: country.continent,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link
            href={`/region/${slugify(country.region)}`}
            className="hover:text-foreground transition-colors"
          >
            {country.region}
          </Link>
          <span>/</span>
          <span className="text-foreground">{country.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8 flex items-start gap-4">
          <span className="text-6xl leading-none" role="img" aria-label={`Bandera de ${country.name}`}>
            {country.flag}
          </span>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {country.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {country.officialName}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link href={`/region/${slugify(country.region)}`}>
                <Badge variant="secondary">{country.region}</Badge>
              </Link>
              {country.subregion && (
                <Link href={`/paises/subregion/${slugify(country.subregion)}`}>
                  <Badge variant="outline">{country.subregion}</Badge>
                </Link>
              )}
              {country.independent && <Badge>Independiente</Badge>}
              {country.unMember && <Badge variant="outline">Miembro ONU</Badge>}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Población" value={formatPopulation(country.population)} />
          <StatCard label="Área" value={`${formatArea(country.area)} km²`} />
          <StatCard label="Capital" value={country.capital} />
          <StatCard
            label="Idiomas"
            value={country.languages.length > 0 ? country.languages.join(", ") : "N/A"}
          />
        </div>

        <Separator className="my-8" />

        {/* Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Geografía</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow
                label="Región"
                value={
                  <Link
                    href={`/region/${slugify(country.region)}`}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {country.region}
                  </Link>
                }
              />
              <DetailRow
                label="Subregión"
                value={
                  country.subregion ? (
                    <Link
                      href={`/paises/subregion/${slugify(country.subregion)}`}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      {country.subregion}
                    </Link>
                  ) : (
                    "N/A"
                  )
                }
              />
              <DetailRow
                label="Continente"
                value={
                  <Link
                    href={`/paises/continente/${slugify(country.continent)}`}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {country.continent}
                  </Link>
                }
              />
              <DetailRow
                label="Coordenadas"
                value={`${country.latlng[0].toFixed(2)}°, ${country.latlng[1].toFixed(2)}°`}
              />
              <DetailRow
                label="Sin litoral"
                value={country.landlocked ? "Sí" : "No"}
              />
              <DetailRow
                label="Zonas horarias"
                value={
                  country.timezones.length > 0 ? (
                    <GroupedLinkList
                      links={country.timezones.map((timezone) => ({
                        href: `/paises/zona-horaria/${slugify(timezone)}`,
                        label: timezone,
                      }))}
                    />
                  ) : (
                    "N/A"
                  )
                }
              />
              {country.maps && (
                <a
                  href={country.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm underline underline-offset-2 hover:text-foreground text-muted-foreground"
                >
                  Ver en Google Maps &rarr;
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow
                label="Monedas"
                value={
                  country.currencies.length > 0
                    ? (
                      <GroupedLinkList
                        links={country.currencies.map((currency) => ({
                          href: `/paises/moneda/${slugify(currency.name)}`,
                          label: `${currency.name} (${currency.symbol || "N/A"})`,
                        }))}
                      />
                    )
                    : "N/A"
                }
              />
              <DetailRow
                label="Código de llamada"
                value={country.callingCode || "N/A"}
              />
              <DetailRow
                label="Dominio de nivel superior"
                value={country.tld.join(", ") || "N/A"}
              />
              <DetailRow
                label="Idiomas"
                value={
                  country.languages.length > 0 ? (
                    <GroupedLinkList
                      links={country.languages.map((language) => ({
                        href: `/paises/idioma/${slugify(language)}`,
                        label: language,
                      }))}
                    />
                  ) : (
                    "N/A"
                  )
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Border countries — internal linking */}
        {borderCountries.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Países Fronterizos
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {borderCountries.map((bc) => (
                <CountryCard key={bc.slug} country={bc} />
              ))}
            </div>
          </section>
        )}

        {/* More from this region — internal linking */}
        {regionCountries.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">
                Más países en {country.region}
              </h2>
              <Link
                href={`/region/${slugify(country.region)}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver todos &rarr;
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {regionCountries.map((rc) => (
                <CountryCard key={rc.slug} country={rc} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold text-lg truncate">{value}</p>
      </CardContent>
    </Card>
  );
}

function GroupedLinkList({ links }: { links: { href: string; label: string }[] }) {
  return (
    <span className="inline-flex flex-wrap justify-end gap-x-1.5 gap-y-1">
      {links.map((link) => (
        <Link
          key={`${link.href}-${link.label}`}
          href={link.href}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
