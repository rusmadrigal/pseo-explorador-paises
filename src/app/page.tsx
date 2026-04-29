import { getAllCountries, getRegions } from "@/lib/countries";
import { SearchCountries } from "@/components/search-countries";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/countries";

export default async function HomePage() {
  const [countries, regions] = await Promise.all([
    getAllCountries(),
    getRegions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <section className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Explore Every Country in the World
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Discover detailed profiles for {countries.length} countries —
          population data, languages spoken, currencies, geography, and much
          more. Browse by region or search for any country.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {regions.map((region) => (
            <Link key={region} href={`/region/${slugify(region)}`}>
              <Badge variant="secondary" className="cursor-pointer">
                {region}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      <SearchCountries countries={countries} regions={regions} />
    </main>
  );
}
