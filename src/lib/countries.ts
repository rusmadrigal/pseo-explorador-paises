export interface Country {
  name: string;
  officialName: string;
  slug: string;
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

const API_BASE = "https://restcountries.com/v3.1/all";
const FIELDS_1 = "name,capital,region,subregion,population,area,languages,currencies,timezones,flag";
const FIELDS_2 = "name,flags,coatOfArms,maps,borders,tld,idd,independent,unMember,landlocked";
const FIELDS_3 = "name,continents,latlng,capitalInfo";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCountry(raw: Record<string, unknown>): Country {
  const name = (raw.name as Record<string, unknown>)?.common as string ?? "";
  const officialName = (raw.name as Record<string, unknown>)?.official as string ?? name;

  const currenciesRaw = (raw.currencies ?? {}) as Record<string, { name: string; symbol: string }>;
  const currencies = Object.values(currenciesRaw).map((c) => ({
    name: c.name,
    symbol: c.symbol ?? "",
  }));

  const languagesRaw = (raw.languages ?? {}) as Record<string, string>;
  const languages = Object.values(languagesRaw);

  const idd = raw.idd as { root?: string; suffixes?: string[] } | undefined;
  const callingCode = idd
    ? `${idd.root ?? ""}${(idd.suffixes ?? [])[0] ?? ""}`
    : "";

  const flags = raw.flags as Record<string, string> | undefined;
  const coatOfArms = raw.coatOfArms as Record<string, string> | undefined;

  return {
    name,
    officialName,
    slug: slugify(name),
    capital: ((raw.capitalInfo ? (raw.capital as string[]) : null) ?? ["N/A"])[0] ?? "N/A",
    region: (raw.region as string) ?? "Unknown",
    subregion: (raw.subregion as string) ?? "",
    population: (raw.population as number) ?? 0,
    area: (raw.area as number) ?? 0,
    languages,
    currencies,
    timezones: (raw.timezones as string[]) ?? [],
    flag: (raw.flag as string) ?? "",
    flagPng: flags?.png ?? "",
    flagSvg: flags?.svg ?? "",
    coatOfArms: coatOfArms?.svg ?? "",
    maps: (raw.maps as Record<string, string>)?.googleMaps ?? "",
    borders: (raw.borders as string[]) ?? [],
    tld: (raw.tld as string[]) ?? [],
    callingCode,
    independent: (raw.independent as boolean) ?? false,
    unMember: (raw.unMember as boolean) ?? false,
    landlocked: (raw.landlocked as boolean) ?? false,
    continent: ((raw.continents as string[]) ?? ["Unknown"])[0],
    latlng: (raw.latlng as [number, number]) ?? [0, 0],
  };
}

let cachedCountries: Country[] | null = null;

async function fetchFields(fields: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${API_BASE}?fields=${fields}`);
  if (!res.ok) throw new Error(`Failed to fetch countries (${fields}): ${res.status}`);
  return (await res.json()) as Record<string, unknown>[];
}

export async function getAllCountries(): Promise<Country[]> {
  if (cachedCountries) return cachedCountries;

  const [batch1, batch2, batch3] = await Promise.all([
    fetchFields(FIELDS_1),
    fetchFields(FIELDS_2),
    fetchFields(FIELDS_3),
  ]);

  const map2 = new Map<string, Record<string, unknown>>();
  for (const item of batch2) {
    const name = (item.name as Record<string, unknown>)?.common as string;
    if (name) map2.set(name, item);
  }
  const map3 = new Map<string, Record<string, unknown>>();
  for (const item of batch3) {
    const name = (item.name as Record<string, unknown>)?.common as string;
    if (name) map3.set(name, item);
  }

  const merged = batch1.map((item) => {
    const name = (item.name as Record<string, unknown>)?.common as string;
    return { ...item, ...map2.get(name), ...map3.get(name) };
  });

  cachedCountries = merged
    .map(parseCountry)
    .filter((c) => c.name && c.region)
    .sort((a, b) => a.name.localeCompare(b.name));

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

  const res = await fetch(
    `https://restcountries.com/v3.1/alpha?codes=${country.borders.join(",")}&fields=name`
  );
  if (!res.ok) return [];

  const data = (await res.json()) as Record<string, unknown>[];
  const borderSlugs = new Set(
    data.map((d) => slugify((d.name as Record<string, unknown>)?.common as string ?? ""))
  );

  return allCountries.filter((c) => borderSlugs.has(c.slug));
}

export function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

export function formatArea(area: number): string {
  return new Intl.NumberFormat("en-US").format(area);
}

export { slugify };
