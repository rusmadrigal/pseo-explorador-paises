export interface Country {
  name: string;
  officialName: string;
  slug: string;
  cca3: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  languages: string[];
  currencies: { name: string; symbol: string }[];
  timezones: string[];
  flag: string;
  flagPng: string;
  flagSvg: string;
  coatOfArms: string;
  maps: string;
  borders: string[];
  tld: string[];
  callingCode: string;
  independent: boolean;
  unMember: boolean;
  landlocked: boolean;
  continent: string;
  latlng: [number, number];
}

export type CountryGroupType =
  | "idioma"
  | "moneda"
  | "subregion"
  | "continente"
  | "zona-horaria";

const API_V5_BASE = "https://api.restcountries.com/countries/v5";
const SNAPSHOT_PATH = "@/data/countries.json";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

let cachedCountries: Country[] | null = null;

function isCountryArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value);
}

async function loadCountriesSnapshot(): Promise<Country[]> {
  const snapshot = (await import(SNAPSHOT_PATH)).default as Country[];
  return snapshot;
}

async function fetchCountriesV5(apiKey: string): Promise<Country[]> {
  const responseFields = [
    "names.common",
    "names.official",
    "region",
    "subregion",
    "population",
    "area.kilometers",
    "languages",
    "currencies",
    "timezones",
    "flag.emoji",
    "codes.alpha_2",
    "codes.alpha_3",
    "borders",
    "tld",
    "calling_codes",
    "classification.sovereign",
    "memberships.un",
    "landlocked",
    "coordinates.lat",
    "coordinates.lng",
    "capitals.name",
  ].join(",");

  const countries: Country[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = new URL(`${API_V5_BASE}`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("response_fields", responseFields);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch countries v5: ${res.status}`);
    }

    const payload = (await res.json()) as {
      success?: boolean;
      data?: Record<string, unknown>[] | null;
      errors?: { message: string }[];
    };

    if (payload.success === false || !payload.data) {
      const message =
        payload.errors?.map((error) => error.message).join("; ") ??
        "Unknown v5 API error";
      throw new Error(message);
    }

    if (!isCountryArray(payload.data) || payload.data.length === 0) {
      break;
    }

    countries.push(...payload.data.map(parseCountryV5));
    if (payload.data.length < limit) break;
    offset += limit;
  }

  return countries
    .filter((country) => country.name && country.region)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseCountryV5(raw: Record<string, unknown>): Country {
  const names = raw.names as Record<string, unknown> | undefined;
  const name = (names?.common as string) ?? "";
  const officialName = (names?.official as string) ?? name;
  const codes = raw.codes as Record<string, string> | undefined;
  const iso2 = codes?.alpha_2 ?? "";

  const currenciesRaw = (raw.currencies ?? []) as {
    name?: string;
    symbol?: string;
  }[];
  const currencies = currenciesRaw.map((currency) => ({
    name: currency.name ?? "",
    symbol: currency.symbol ?? "",
  }));

  const languagesRaw = (raw.languages ?? []) as { name?: string }[];
  const languages = languagesRaw.map((language) => language.name ?? "").filter(Boolean);

  const flag = raw.flag as Record<string, string> | undefined;
  const coordinates = raw.coordinates as { lat?: number; lng?: number } | undefined;
  const area = raw.area as { kilometers?: number } | undefined;
  const capitals = (raw.capitals ?? []) as { name?: string }[];
  const classification = raw.classification as { sovereign?: boolean } | undefined;
  const memberships = raw.memberships as { un?: boolean } | undefined;
  const callingCodes = (raw.calling_codes ?? []) as string[];
  const lat = coordinates?.lat ?? 0;
  const lng = coordinates?.lng ?? 0;
  const region = (raw.region as string) ?? "Unknown";
  const subregion = (raw.subregion as string) ?? "";

  return {
    name,
    officialName,
    slug: slugify(name),
    cca3: codes?.alpha_3 ?? "",
    capital: capitals[0]?.name ?? "N/A",
    region,
    subregion,
    population: (raw.population as number) ?? 0,
    area: area?.kilometers ?? 0,
    languages,
    currencies,
    timezones: (raw.timezones as string[]) ?? [],
    flag: flag?.emoji ?? "",
    flagPng: iso2 ? `https://flagcdn.com/w320/${iso2.toLowerCase()}.png` : "",
    flagSvg: iso2 ? `https://flagcdn.com/${iso2.toLowerCase()}.svg` : "",
    coatOfArms: "",
    maps: `https://www.google.com/maps/@${lat},${lng},5z`,
    borders: (raw.borders as string[]) ?? [],
    tld: ((raw.tld as string[]) ?? []).map((entry) => entry.replace(/^\./, "")),
    callingCode: callingCodes[0] ?? "",
    independent: classification?.sovereign ?? false,
    unMember: memberships?.un ?? false,
    landlocked: (raw.landlocked as boolean) ?? false,
    continent: getContinentFromRegion(region, subregion),
    latlng: [lat, lng],
  };
}

function getContinentFromRegion(region: string, subregion: string): string {
  if (region === "Americas") {
    return subregion === "South America" ? "South America" : "North America";
  }
  if (region === "Antarctic") return "Antarctica";
  return region;
}

export async function getAllCountries(): Promise<Country[]> {
  if (cachedCountries) return cachedCountries;

  const apiKey = process.env.RESTCOUNTRIES_API_KEY?.trim();

  if (apiKey) {
    try {
      cachedCountries = await fetchCountriesV5(apiKey);
      return cachedCountries;
    } catch (error) {
      console.warn(
        "[countries] REST Countries v5 failed, using local snapshot:",
        error instanceof Error ? error.message : error
      );
    }
  }

  cachedCountries = await loadCountriesSnapshot();
  return cachedCountries;
}

export async function getCountryBySlug(slug: string): Promise<Country | undefined> {
  const countries = await getAllCountries();
  return countries.find((c) => c.slug === slug);
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  const countries = await getAllCountries();
  return countries.filter(
    (c) => slugify(c.region) === region
  );
}

export async function getRegions(): Promise<string[]> {
  const countries = await getAllCountries();
  const regions = new Set(countries.map((c) => c.region));
  return Array.from(regions).sort();
}

export async function getBorderCountries(country: Country): Promise<Country[]> {
  if (!country.borders.length) return [];
  const allCountries = await getAllCountries();
  const borderCodes = new Set(country.borders);
  return allCountries.filter((candidate) => borderCodes.has(candidate.cca3));
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export async function getGroupValues(type: CountryGroupType): Promise<string[]> {
  const countries = await getAllCountries();

  switch (type) {
    case "idioma":
      return uniqueSorted(countries.flatMap((c) => c.languages));
    case "moneda":
      return uniqueSorted(countries.flatMap((c) => c.currencies.map((currency) => currency.name)));
    case "subregion":
      return uniqueSorted(countries.map((c) => c.subregion));
    case "continente":
      return uniqueSorted(countries.map((c) => c.continent));
    case "zona-horaria":
      return uniqueSorted(countries.flatMap((c) => c.timezones));
    default:
      return [];
  }
}

export async function getCountriesByGroup(
  type: CountryGroupType,
  valueSlug: string
): Promise<{ value: string; countries: Country[] } | undefined> {
  const countries = await getAllCountries();
  const values = await getGroupValues(type);
  const matchedValue = values.find((value) => slugify(value) === valueSlug);

  if (!matchedValue) return undefined;

  let matchedCountries: Country[] = [];
  switch (type) {
    case "idioma":
      matchedCountries = countries.filter((c) => c.languages.some((language) => language === matchedValue));
      break;
    case "moneda":
      matchedCountries = countries.filter((c) =>
        c.currencies.some((currency) => currency.name === matchedValue)
      );
      break;
    case "subregion":
      matchedCountries = countries.filter((c) => c.subregion === matchedValue);
      break;
    case "continente":
      matchedCountries = countries.filter((c) => c.continent === matchedValue);
      break;
    case "zona-horaria":
      matchedCountries = countries.filter((c) => c.timezones.some((timezone) => timezone === matchedValue));
      break;
  }

  return {
    value: matchedValue,
    countries: matchedCountries,
  };
}

export async function getRegionBySlug(
  regionSlug: string
): Promise<string | undefined> {
  const regions = await getRegions();
  return regions.find((r) => slugify(r) === regionSlug);
}

export async function getCountriesByGroupInRegion(
  regionSlug: string,
  type: CountryGroupType,
  valueSlug: string
): Promise<{ value: string; countries: Country[]; regionName: string } | undefined> {
  const regionName = await getRegionBySlug(regionSlug);
  if (!regionName) return undefined;

  const groupResult = await getCountriesByGroup(type, valueSlug);
  if (!groupResult) return undefined;

  const countries = groupResult.countries.filter(
    (c) => slugify(c.region) === regionSlug
  );
  if (countries.length === 0) return undefined;

  return {
    value: groupResult.value,
    countries,
    regionName,
  };
}

export async function getGroupValuesInRegion(
  regionSlug: string,
  type: CountryGroupType
): Promise<string[]> {
  const regionName = await getRegionBySlug(regionSlug);
  if (!regionName) return [];

  const countries = await getCountriesByRegion(regionSlug);
  switch (type) {
    case "idioma":
      return uniqueSorted(countries.flatMap((c) => c.languages));
    case "moneda":
      return uniqueSorted(
        countries.flatMap((c) => c.currencies.map((currency) => currency.name))
      );
    case "subregion":
      return uniqueSorted(countries.map((c) => c.subregion));
    case "continente":
      return uniqueSorted(countries.map((c) => c.continent));
    case "zona-horaria":
      return uniqueSorted(countries.flatMap((c) => c.timezones));
    default:
      return [];
  }
}

export interface CountryFacet {
  tipo: CountryGroupType;
  value: string;
}

export function getCountryFacets(country: Country): CountryFacet[] {
  const facets: CountryFacet[] = [];

  if (country.subregion) {
    facets.push({ tipo: "subregion", value: country.subregion });
  }
  facets.push({ tipo: "continente", value: country.continent });
  for (const language of country.languages) {
    facets.push({ tipo: "idioma", value: language });
  }
  for (const currency of country.currencies) {
    facets.push({ tipo: "moneda", value: currency.name });
  }
  for (const timezone of country.timezones) {
    facets.push({ tipo: "zona-horaria", value: timezone });
  }

  return facets;
}

export function countryMatchesFacet(
  country: Country,
  tipo: CountryGroupType,
  value: string
): boolean {
  switch (tipo) {
    case "idioma":
      return country.languages.includes(value);
    case "moneda":
      return country.currencies.some((c) => c.name === value);
    case "subregion":
      return country.subregion === value;
    case "continente":
      return country.continent === value;
    case "zona-horaria":
      return country.timezones.includes(value);
    default:
      return false;
  }
}

export function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

export function formatArea(area: number): string {
  return new Intl.NumberFormat("es-ES").format(area);
}

export { slugify };
