import type { Country, CountryGroupType } from "@/lib/countries";
import { slugify } from "@/lib/countries";

export const GROUP_TYPES: CountryGroupType[] = [
  "idioma",
  "moneda",
  "subregion",
  "continente",
  "zona-horaria",
];

export function regionPath(region: string): string {
  return `/region/${slugify(region)}`;
}

export function countryPath(country: Pick<Country, "region" | "slug">): string {
  return `${regionPath(country.region)}/${country.slug}`;
}

export function countryFacetPath(
  country: Pick<Country, "region" | "slug">,
  tipo: CountryGroupType,
  value: string
): string {
  return `${countryPath(country)}/${tipo}/${slugify(value)}`;
}

export function regionCategoryHubPath(
  region: string,
  tipo: CountryGroupType
): string {
  return `${regionPath(region)}/${tipo}`;
}

export function regionCategoryPath(
  region: string,
  tipo: CountryGroupType,
  value: string
): string {
  return `${regionPath(region)}/${tipo}/${slugify(value)}`;
}

export function southAmericaLandingPath(): string {
  return "/region/americas/sudamerica";
}
