"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CountryCard } from "@/components/country-card";
import type { Country } from "@/lib/countries";

interface SearchCountriesProps {
  countries: Country[];
  regions: string[];
}

export function SearchCountries({ countries, regions }: SearchCountriesProps) {
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.capital.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = !activeRegion || c.region === activeRegion;
      return matchesQuery && matchesRegion;
    });
  }, [countries, query, activeRegion]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Buscar países o capitales..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={activeRegion === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveRegion(null)}
          >
            Todos ({countries.length})
          </Badge>
          {regions.map((region) => (
            <Badge
              key={region}
              variant={activeRegion === region ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setActiveRegion(activeRegion === region ? null : region)
              }
            >
              {region}
            </Badge>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "país" : "países"} encontrados
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((country) => (
          <CountryCard key={country.slug} country={country} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No se encontraron países. Intenta con otro término.
        </p>
      )}
    </div>
  );
}
