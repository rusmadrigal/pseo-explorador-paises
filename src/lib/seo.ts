import {
  Country,
  CountryGroupType,
  formatPopulation,
  slugify,
} from "@/lib/countries";
import {
  countryFacetPath,
  countryPath,
  regionCategoryHubPath,
  regionCategoryPath,
  regionPath,
  southAmericaLandingPath,
} from "@/lib/paths";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const GROUP_LABELS: Record<CountryGroupType, string> = {
  idioma: "idioma",
  moneda: "moneda",
  subregion: "subregión",
  continente: "continente",
  "zona-horaria": "zona horaria",
};

export const GROUP_TYPE_PLURAL: Record<CountryGroupType, string> = {
  idioma: "idiomas",
  moneda: "monedas",
  subregion: "subregiones",
  continente: "continentes",
  "zona-horaria": "zonas horarias",
};

export function isGroupType(value: string): value is CountryGroupType {
  return value in GROUP_LABELS;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://world-explorer.vercel.app";
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };
}

export function getPrimaryRegion(countries: Country[]): string | undefined {
  if (countries.length === 0) return undefined;
  const counts = new Map<string, number>();
  for (const country of countries) {
    counts.set(country.region, (counts.get(country.region) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function getRegionIntro(
  regionName: string,
  countryCount: number,
  totalPopulation: number,
  totalArea: number
): string {
  return `${regionName} agrupa ${countryCount} países con una población combinada de ${formatPopulation(totalPopulation)} y una superficie total de ${new Intl.NumberFormat("es-ES").format(totalArea)} km². Desde esta página hub puedes explorar cada nación, sus subregiones y enlaces hacia perfiles individuales.`;
}

export function getCategoryIntro(
  tipo: CountryGroupType,
  value: string,
  countryCount: number,
  totalPopulation: number,
  regionName?: string
): string {
  const populationText = formatPopulation(totalPopulation);
  const scope = regionName ? ` en ${regionName}` : "";

  switch (tipo) {
    case "idioma":
      return `En esta categoría encontrarás ${countryCount} países${scope} donde el idioma ${value} tiene presencia relevante, con una población combinada de ${populationText}.`;
    case "moneda":
      return `Estos ${countryCount} países${scope} utilizan la moneda ${value} (población total: ${populationText}).`;
    case "subregion":
      return `La subregión ${value} incluye ${countryCount} países${scope} y ${populationText} habitantes en conjunto.`;
    case "continente":
      return `En el continente ${value} hay ${countryCount} países${scope} registrados, con ${populationText} de población combinada.`;
    case "zona-horaria":
      return `${countryCount} países${scope} comparten la zona horaria ${value}, sumando ${populationText} de población.`;
    default:
      return `Listado de ${countryCount} países agrupados por ${GROUP_LABELS[tipo]}: ${value}.`;
  }
}

export function getCountryFacetIntro(
  country: Country,
  tipo: CountryGroupType,
  value: string
): string {
  const label = GROUP_LABELS[tipo];
  return `En ${country.name} (${country.region}), el criterio de ${label} «${value}» forma parte de su perfil programático. Explora el contexto regional y países relacionados en la misma categoría.`;
}

export function getCountryIntro(country: Country): string {
  const languages =
    country.languages.length > 0 ? country.languages.join(", ") : "varios idiomas";

  return `${country.name} es un país de ${country.region}${country.subregion ? ` (${country.subregion})` : ""}, con capital en ${country.capital}, población de ${formatPopulation(country.population)} y ${languages} como idiomas principales.`;
}

export function buildCountryBreadcrumbs(country: Country): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: country.region, href: regionPath(country.region) },
    { label: country.name },
  ];
}

export function buildRegionBreadcrumbs(regionName: string): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: regionName },
  ];
}

export function buildRegionCategoryBreadcrumbs(
  regionName: string,
  tipo: CountryGroupType,
  value: string
): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: regionName, href: regionPath(regionName) },
    {
      label: GROUP_TYPE_PLURAL[tipo],
      href: regionCategoryHubPath(regionName, tipo),
    },
    { label: value },
  ];
}

export function buildCountryFacetBreadcrumbs(
  country: Country,
  tipo: CountryGroupType,
  value: string
): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: country.region, href: regionPath(country.region) },
    { label: country.name, href: countryPath(country) },
    { label: value },
  ];
}

export function buildSouthAmericaBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: "Americas", href: regionPath("Americas") },
    { label: "Sudamérica" },
  ];
}

export function getCountryCategoryLinks(
  country: Country
): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];

  if (country.subregion) {
    links.push({
      label: `Subregión: ${country.subregion}`,
      href: countryFacetPath(country, "subregion", country.subregion),
    });
  }

  links.push({
    label: `Continente: ${country.continent}`,
    href: countryFacetPath(country, "continente", country.continent),
  });

  for (const language of country.languages) {
    links.push({
      label: `Idioma: ${language}`,
      href: countryFacetPath(country, "idioma", language),
    });
  }

  for (const currency of country.currencies) {
    links.push({
      label: `Moneda: ${currency.name}`,
      href: countryFacetPath(country, "moneda", currency.name),
    });
  }

  if (country.timezones.length > 0) {
    links.push({
      label: `Zona horaria: ${country.timezones[0]}`,
      href: countryFacetPath(country, "zona-horaria", country.timezones[0]),
    });
  }

  return links;
}

export function getCountryRegionCategoryLinks(
  country: Country
): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];

  if (country.subregion) {
    links.push({
      label: `${country.subregion} en ${country.region}`,
      href: regionCategoryPath(country.region, "subregion", country.subregion),
    });
  }

  for (const language of country.languages.slice(0, 2)) {
    links.push({
      label: `${language} en ${country.region}`,
      href: regionCategoryPath(country.region, "idioma", language),
    });
  }

  for (const currency of country.currencies.slice(0, 2)) {
    links.push({
      label: `${currency.name} en ${country.region}`,
      href: regionCategoryPath(country.region, "moneda", currency.name),
    });
  }

  return links;
}
