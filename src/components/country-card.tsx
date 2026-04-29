import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Country } from "@/lib/countries";
import { formatPopulation } from "@/lib/countries";

export function CountryCard({ country }: { country: Country }) {
  return (
    <Link href={`/country/${country.slug}`} className="group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-foreground/20">
        <CardContent className="flex gap-4 p-4">
          <span className="text-4xl leading-none" role="img" aria-label={`Bandera de ${country.name}`}>
            {country.flag}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {country.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {country.capital} &middot; {formatPopulation(country.population)}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {country.region}
              </Badge>
              {country.languages.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {country.languages[0]}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
