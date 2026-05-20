import { Country, CountryGroupType, formatPopulation, slugify } from "@/lib/countries";

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
  totalPopulation: number
): string {
  const populationText = formatPopulation(totalPopulation);

  switch (tipo) {
    case "idioma":
      return `En esta categoría encontrarás ${countryCount} países donde el idioma ${value} tiene presencia relevante, con una población combinada de ${populationText}. Cada ficha enlaza al perfil completo del país.`;
    case "moneda":
      return `Estos ${countryCount} países utilizan la moneda ${value} (población total: ${populationText}). Explora capitales, idiomas y datos geográficos de cada nación.`;
    case "subregion":
      return `La subregión ${value} incluye ${countryCount} países y ${populationText} habitantes en conjunto. Navega hacia los perfiles individuales o vuelve al hub de su región principal.`;
    case "continente":
      return `En el continente ${value} hay ${countryCount} países registrados, con ${populationText} de población combinada. Esta página agrupa naciones por intención geográfica amplia.`;
    case "zona-horaria":
      return `${countryCount} países comparten la zona horaria ${value}, sumando ${populationText} de población. Útil para comparar ubicaciones y vecinos en el mismo huso horario.`;
    default:
      return `Listado de ${countryCount} países agrupados por ${GROUP_LABELS[tipo]}: ${value}.`;
  }
}

export function getCountryIntro(country: Country): string {
  const languages =
    country.languages.length > 0 ? country.languages.join(", ") : "varios idiomas";
  const currencies =
    country.currencies.length > 0
      ? country.currencies.map((c) => c.name).join(", ")
      : "moneda local";

  return `${country.name} es un país de ${country.region}${country.subregion ? ` (${country.subregion})` : ""}, con capital en ${country.capital}, población de ${formatPopulation(country.population)} y ${languages} como idiomas principales. Usa los enlaces internos para explorar su región, categorías relacionadas y países fronterizos.`;
}

export function buildCategoryBreadcrumbs(
  tipo: CountryGroupType,
  value: string,
  countries: Country[]
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }];
  const primaryRegion = getPrimaryRegion(countries);

  if (tipo === "subregion" && primaryRegion) {
    items.push({
      label: primaryRegion,
      href: `/region/${slugify(primaryRegion)}`,
    });
    items.push({ label: value });
    return items;
  }

  items.push({
    label: `Países por ${GROUP_LABELS[tipo]}`,
    href: `/paises/${tipo}`,
  });
  items.push({ label: value });
  return items;
}

export function buildCountryBreadcrumbs(country: Country): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: country.region, href: `/region/${slugify(country.region)}` },
    { label: country.name },
  ];
}

export function buildRegionBreadcrumbs(regionName: string): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: regionName },
  ];
}

export function buildSouthAmericaBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Inicio", href: "/" },
    { label: "Americas", href: "/region/americas" },
    { label: "Sudamérica" },
  ];
}

/** Rutas de categoría relacionadas para enlazar desde un país */
export function getCountryCategoryLinks(country: Country): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];

  if (country.subregion) {
    links.push({
      label: `Subregión: ${country.subregion}`,
      href: `/paises/subregion/${slugify(country.subregion)}`,
    });
  }

  links.push({
    label: `Continente: ${country.continent}`,
    href: `/paises/continente/${slugify(country.continent)}`,
  });

  for (const language of country.languages) {
    links.push({
      label: `Idioma: ${language}`,
      href: `/paises/idioma/${slugify(language)}`,
    });
  }

  for (const currency of country.currencies) {
    links.push({
      label: `Moneda: ${currency.name}`,
      href: `/paises/moneda/${slugify(currency.name)}`,
    });
  }

  if (country.timezones.length > 0) {
    links.push({
      label: `Zona horaria: ${country.timezones[0]}`,
      href: `/paises/zona-horaria/${slugify(country.timezones[0])}`,
    });
  }

  return links;
}
