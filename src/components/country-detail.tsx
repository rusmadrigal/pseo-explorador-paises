import Link from "next/link";
import { ReactNode } from "react";
import {
  Country,
  formatArea,
  formatPopulation,
  getAllCountries,
  getBorderCountries,
  slugify,
} from "@/lib/countries";
import {
  buildCountryBreadcrumbs,
  getCountryCategoryLinks,
  getCountryIntro,
  getCountryRegionCategoryLinks,
} from "@/lib/seo";
import { countryFacetPath, regionPath } from "@/lib/paths";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CountryCard } from "@/components/country-card";

interface CountryDetailProps {
  country: Country;
  regionSlug: string;
}

export async function CountryDetail({ country, regionSlug }: CountryDetailProps) {
  if (slugify(country.region) !== regionSlug) {
    return null;
  }

  const borderCountries = await getBorderCountries(country);
  const allCountries = await getAllCountries();
  const regionCountries = allCountries
    .filter((c) => c.region === country.region && c.slug !== country.slug)
    .slice(0, 6);

  const categoryLinks = getCountryCategoryLinks(country);
  const regionCategoryLinks = getCountryRegionCategoryLinks(country);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Country",
    name: country.name,
    alternateName: country.officialName,
    description: getCountryIntro(country),
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
        <Breadcrumbs items={buildCountryBreadcrumbs(country)} />

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Página de país
        </p>

        <div className="mb-4 flex items-start gap-4">
          <span
            className="text-6xl leading-none"
            role="img"
            aria-label={`Bandera de ${country.name}`}
          >
            {country.flag}
          </span>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {country.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{country.officialName}</p>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {getCountryIntro(country)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link href={regionPath(country.region)}>
                <Badge variant="secondary">{country.region}</Badge>
              </Link>
              {country.subregion && (
                <Link
                  href={countryFacetPath(country, "subregion", country.subregion)}
                >
                  <Badge variant="outline">{country.subregion}</Badge>
                </Link>
              )}
            </div>
          </div>
        </div>

        {categoryLinks.length > 0 && (
          <section className="mb-4 rounded-lg border bg-muted/30 p-4">
            <h2 className="font-heading text-sm font-semibold">
              Atributos de {country.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {categoryLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Badge variant="outline">{link.label}</Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {regionCategoryLinks.length > 0 && (
          <section className="mb-8 rounded-lg border bg-muted/30 p-4">
            <h2 className="font-heading text-sm font-semibold">
              Categorías en {country.region}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {regionCategoryLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Badge variant="secondary">{link.label}</Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Población" value={formatPopulation(country.population)} />
          <StatCard label="Área" value={`${formatArea(country.area)} km²`} />
          <StatCard label="Capital" value={country.capital} />
          <StatCard
            label="Idiomas"
            value={
              country.languages.length > 0 ? country.languages.join(", ") : "N/A"
            }
          />
        </div>

        <Separator className="my-8" />

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
                    href={regionPath(country.region)}
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
                      href={countryFacetPath(country, "subregion", country.subregion)}
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
                    href={countryFacetPath(country, "continente", country.continent)}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    {country.continent}
                  </Link>
                }
              />
              <DetailRow
                label="Zonas horarias"
                value={
                  country.timezones.length > 0 ? (
                    <GroupedLinkList
                      links={country.timezones.map((timezone) => ({
                        href: countryFacetPath(country, "zona-horaria", timezone),
                        label: timezone,
                      }))}
                    />
                  ) : (
                    "N/A"
                  )
                }
              />
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
                  country.currencies.length > 0 ? (
                    <GroupedLinkList
                      links={country.currencies.map((currency) => ({
                        href: countryFacetPath(country, "moneda", currency.name),
                        label: `${currency.name} (${currency.symbol || "N/A"})`,
                      }))}
                    />
                  ) : (
                    "N/A"
                  )
                }
              />
              <DetailRow
                label="Idiomas"
                value={
                  country.languages.length > 0 ? (
                    <GroupedLinkList
                      links={country.languages.map((language) => ({
                        href: countryFacetPath(country, "idioma", language),
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

        {borderCountries.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Países fronterizos
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {borderCountries.map((bc) => (
                <CountryCard key={bc.slug} country={bc} />
              ))}
            </div>
          </section>
        )}

        {regionCountries.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-semibold">
                Más países en {country.region}
              </h2>
              <Link
                href={regionPath(country.region)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver hub regional &rarr;
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
