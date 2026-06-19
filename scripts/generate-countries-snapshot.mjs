/**
 * Generates src/data/countries.json from open datasets (mledoze + dr5hn).
 * Run: node scripts/generate-countries-snapshot.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../src/data/countries.json");

const MLEDOZE_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
const DR5HN_URL =
  "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json";

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getContinent(region, subregion) {
  if (region === "Americas") {
    return subregion === "South America" ? "South America" : "North America";
  }
  if (region === "Antarctic") return "Antarctica";
  return region;
}

function parseRecord(raw, dr5hnByIso2) {
  const name = raw.name?.common ?? "";
  const officialName = raw.name?.official ?? name;
  const iso2 = raw.cca2 ?? "";
  const extra = dr5hnByIso2.get(iso2);

  const currenciesRaw = raw.currencies ?? {};
  const currencies = Object.values(currenciesRaw).map((c) => ({
    name: c.name,
    symbol: c.symbol ?? "",
  }));

  const languages = Object.values(raw.languages ?? {});
  const idd = raw.idd ?? {};
  const callingCode = `${idd.root ?? ""}${(idd.suffixes ?? [])[0] ?? ""}`;

  const lat = Number(extra?.latitude ?? raw.latlng?.[0] ?? 0);
  const lng = Number(extra?.longitude ?? raw.latlng?.[1] ?? 0);

  return {
    name,
    officialName,
    slug: slugify(name),
    cca3: raw.cca3 ?? iso2,
    capital: raw.capital?.[0] ?? extra?.capital ?? "N/A",
    region: raw.region ?? extra?.region ?? "Unknown",
    subregion: raw.subregion ?? extra?.subregion ?? "",
    population: extra?.population ?? 0,
    area: raw.area ?? extra?.area_sq_km ?? 0,
    languages,
    currencies,
    timezones: (extra?.timezones ?? []).map((tz) => tz.zoneName),
    flag: extra?.emoji ?? raw.flag ?? "",
    flagPng: `https://flagcdn.com/w320/${iso2.toLowerCase()}.png`,
    flagSvg: `https://flagcdn.com/${iso2.toLowerCase()}.svg`,
    coatOfArms: "",
    maps: `https://www.google.com/maps/@${lat},${lng},5z`,
    borders: raw.borders ?? [],
    tld: (raw.tld ?? []).map((entry) => entry.replace(/^\./, "")),
    callingCode,
    independent: raw.independent ?? false,
    unMember: raw.unMember ?? false,
    landlocked: raw.landlocked ?? false,
    continent: getContinent(raw.region ?? "", raw.subregion ?? ""),
    latlng: [lat, lng],
  };
}

async function main() {
  const [mledozeRes, dr5hnRes] = await Promise.all([
    fetch(MLEDOZE_URL),
    fetch(DR5HN_URL),
  ]);

  if (!mledozeRes.ok) throw new Error(`mledoze fetch failed: ${mledozeRes.status}`);
  if (!dr5hnRes.ok) throw new Error(`dr5hn fetch failed: ${dr5hnRes.status}`);

  const mledoze = await mledozeRes.json();
  const dr5hn = await dr5hnRes.json();
  const dr5hnByIso2 = new Map(dr5hn.map((country) => [country.iso2, country]));

  const countries = mledoze
    .map((raw) => parseRecord(raw, dr5hnByIso2))
    .filter((country) => country.name && country.region)
    .sort((a, b) => a.name.localeCompare(b.name));

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(countries, null, 2));

  console.log(`Wrote ${countries.length} countries to ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
