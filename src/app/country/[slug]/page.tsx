import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  if (!country) return { title: "Country Not Found" };

  const description = `Discover ${country.name} — capital: ${country.capital}, population: ${formatPopulation(country.population)}, region: ${country.region}. Languages, currencies, geography and more.`;

  return {
    title: `${country.name} — Country Profile & Facts`,
    description,
    openGraph: {
      title: `${country.name} — Country Profile & Facts`,
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
    description: `${country.name} is a country in ${country.region} with a population of ${formatPopulation(country.population)}.`,
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
            Home
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
          <span className="text-6xl leading-none" role="img" aria-label={`Flag of ${country.name}`}>
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
                <Badge variant="outline">{country.subregion}</Badge>
              )}
              {country.independent && <Badge>Independent</Badge>}
              {country.unMember && <Badge variant="outline">UN Member</Badge>}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Population" value={formatPopulation(country.population)} />
          <StatCard label="Area" value={`${formatArea(country.area)} km²`} />
          <StatCard label="Capital" value={country.capital} />
          <StatCard
            label="Languages"
            value={country.languages.length > 0 ? country.languages.join(", ") : "N/A"}
          />
        </div>

        <Separator className="my-8" />

        {/* Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Geography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label="Region" value={country.region} />
              <DetailRow label="Subregion" value={country.subregion || "N/A"} />
              <DetailRow label="Continent" value={country.continent} />
              <DetailRow
                label="Coordinates"
                value={`${country.latlng[0].toFixed(2)}°, ${country.latlng[1].toFixed(2)}°`}
              />
              <DetailRow
                label="Landlocked"
                value={country.landlocked ? "Yes" : "No"}
              />
              <DetailRow
                label="Timezones"
                value={country.timezones.join(", ")}
              />
              {country.maps && (
                <a
                  href={country.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm underline underline-offset-2 hover:text-foreground text-muted-foreground"
                >
                  View on Google Maps &rarr;
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow
                label="Currencies"
                value={
                  country.currencies.length > 0
                    ? country.currencies.map((c) => `${c.name} (${c.symbol})`).join(", ")
                    : "N/A"
                }
              />
              <DetailRow
                label="Calling Code"
                value={country.callingCode || "N/A"}
              />
              <DetailRow
                label="Top Level Domain"
                value={country.tld.join(", ") || "N/A"}
              />
              <DetailRow
                label="Languages"
                value={country.languages.join(", ") || "N/A"}
              />
            </CardContent>
          </Card>
        </div>

        {/* Border countries — internal linking */}
        {borderCountries.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Bordering Countries
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
                More countries in {country.region}
              </h2>
              <Link
                href={`/region/${slugify(country.region)}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all &rarr;
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
