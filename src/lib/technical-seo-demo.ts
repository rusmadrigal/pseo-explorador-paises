import { getCountryFacets, slugify, type CountryGroupType } from "@/lib/countries";
import {
  countryFacetPath,
  countryPath,
  regionCategoryHubPath,
  regionCategoryPath,
  regionPath,
  southAmericaLandingPath,
  GROUP_TYPES,
} from "@/lib/paths";

export type DemoCountry = {
  name: string;
  slug: string;
  region: string;
  subregion: string;
  population: number;
  capital: string;
  continent: string;
  languages: string[];
  currencies: { name: string; symbol: string }[];
  timezones: string[];
  area: number;
};

export type UrlTier = "critica" | "alta" | "media" | "baja";

export interface UrlTierBreakdown {
  tier: UrlTier;
  label: string;
  count: number;
  examples: string[];
  crawlPriority: string;
}

export interface SitemapBreakdown {
  totalUrls: number;
  segments: { label: string; count: number; priority: string }[];
  robotsSitemap: string;
  deduplicationNote: string;
}

export interface CanonicalExample {
  pageType: string;
  pathname: string;
  canonical: string;
  note: string;
}

export interface PaginationPreview {
  basePath: string;
  totalItems: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  visibleItems: string[];
  prevUrl: string | null;
  nextUrl: string | null;
  relTags: string[];
}

export interface FacetUrlExample {
  type: "facet" | "combinado";
  label: string;
  url: string;
  seoAction: "index" | "noindex";
  note: string;
}

export interface FacetAnalysis {
  countryFacetCount: number;
  facetUrls: { label: string; href: string }[];
  urlExamples: {
    facet: FacetUrlExample;
    combined: FacetUrlExample;
  };
  combinatorialRisk: "bajo" | "medio" | "alto";
  riskDetail: string;
  recommendations: string[];
}

export interface IndexationCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

const PAGE_SIZE = 24;

function toCountryShape(country: DemoCountry) {
  return {
    name: country.name,
    slug: country.slug,
    region: country.region,
    subregion: country.subregion,
    population: country.population,
    capital: country.capital,
    continent: country.continent,
    languages: country.languages,
    currencies: country.currencies,
    timezones: country.timezones,
    area: country.area,
    officialName: country.name,
    cca3: country.slug.slice(0, 3).toUpperCase(),
    flag: "",
    flagPng: "",
    flagSvg: "",
    coatOfArms: "",
    maps: "",
    borders: [] as string[],
    tld: [] as string[],
    callingCode: "",
    independent: true,
    unMember: true,
    landlocked: false,
    latlng: [0, 0] as [number, number],
  };
}

export function estimateSitemapBreakdown(
  countryCount: number,
  regionCount: number,
  avgFacetsPerCountry: number,
  regionCategoryCount: number
): SitemapBreakdown {
  const home = 1;
  const regions = regionCount;
  const landings = 1;
  const countries = countryCount;
  const countryFacets = Math.round(countryCount * avgFacetsPerCountry);
  const categoryHubs = regionCount * GROUP_TYPES.length;
  const categoryValues = regionCategoryCount;

  const segments = [
    { label: "Home", count: home, priority: "1.0" },
    { label: "Hubs regionales", count: regions, priority: "0.7" },
    { label: "Landings temáticas", count: landings, priority: "0.75" },
    { label: "Perfiles de país", count: countries, priority: "0.8" },
    { label: "Facets de país", count: countryFacets, priority: "0.75" },
    { label: "Hubs de categoría", count: categoryHubs, priority: "0.6" },
    { label: "Valores de categoría", count: categoryValues, priority: "0.65" },
  ];

  const totalUrls = segments.reduce((sum, segment) => sum + segment.count, 0);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://world-explorer.vercel.app";

  return {
    totalUrls,
    segments,
    robotsSitemap: `${baseUrl}/sitemap.xml`,
    deduplicationNote:
      "sitemap.ts deduplica URLs con Set antes de devolver el array final.",
  };
}

export function buildCrawlBudgetTiers(
  countryCount: number,
  regionCount: number
): UrlTierBreakdown[] {
  const facetEstimate = Math.round(countryCount * 6.5);

  return [
    {
      tier: "critica",
      label: "Home + hubs regionales",
      count: 1 + regionCount,
      examples: ["/", regionPath("Americas")],
      crawlPriority: "Rastrear primero; enlaces desde header y footer",
    },
    {
      tier: "alta",
      label: "Perfiles de país",
      count: countryCount,
      examples: [countryPath({ region: "Americas", slug: "mexico" })],
      crawlPriority: "Prioridad 0.8 en sitemap; enlazados desde hubs",
    },
    {
      tier: "media",
      label: "Facets y categorías regionales",
      count: facetEstimate + regionCount * GROUP_TYPES.length,
      examples: [
        countryFacetPath(
          { region: "Americas", slug: "mexico" },
          "idioma",
          "Spanish"
        ),
        regionCategoryPath("Americas", "idioma", "Spanish"),
      ],
      crawlPriority: "Indexar vía enlazado interno; evitar orphan URLs",
    },
    {
      tier: "baja",
      label: "Combinaciones profundas / paginación",
      count: Math.round(countryCount * 0.4),
      examples: ["/region/americas/idioma/english?page=2"],
      crawlPriority: "rel=next/prev + canonical a página 1 si aplica",
    },
  ];
}

export function getCanonicalExamples(country: DemoCountry): CanonicalExample[] {
  const shape = toCountryShape(country);
  const language = country.languages[0] ?? "English";

  return [
    {
      pageType: "Perfil de país",
      pathname: countryPath(shape),
      canonical: countryPath(shape),
      note: "Self-referencing; evita duplicados con rutas legacy",
    },
    {
      pageType: "Facet de país",
      pathname: countryFacetPath(shape, "idioma", language),
      canonical: countryFacetPath(shape, "idioma", language),
      note: "Canonical apunta a la URL limpia sin query params",
    },
    {
      pageType: "Categoría regional",
      pathname: regionCategoryPath(country.region, "idioma", language),
      canonical: regionCategoryPath(country.region, "idioma", language),
      note: "Una sola URL canónica por valor de facet en la región",
    },
    {
      pageType: "Hub regional",
      pathname: regionPath(country.region),
      canonical: regionPath(country.region),
      note: "Consolida señales en el hub, no en URLs alternativas",
    },
  ];
}

export function buildPaginationPreview(
  regionName: string,
  tipo: CountryGroupType,
  value: string,
  itemNames: string[],
  currentPage: number
): PaginationPreview {
  const basePath = regionCategoryPath(regionName, tipo, value);
  const totalItems = itemNames.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const visibleItems = itemNames.slice(start, start + PAGE_SIZE);

  const pageUrl = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

  const relTags: string[] = [];
  if (page > 1) relTags.push(`<link rel="prev" href="${pageUrl(page - 1)}" />`);
  if (page < totalPages) relTags.push(`<link rel="next" href="${pageUrl(page + 1)}" />`);
  relTags.push(`<link rel="canonical" href="${pageUrl(page)}" />`);

  return {
    basePath,
    totalItems,
    pageSize: PAGE_SIZE,
    totalPages,
    currentPage: page,
    visibleItems,
    prevUrl: page > 1 ? pageUrl(page - 1) : null,
    nextUrl: page < totalPages ? pageUrl(page + 1) : null,
    relTags,
  };
}

export function analyzeFacetedNavigation(country: DemoCountry): FacetAnalysis {
  const shape = toCountryShape(country);
  const facets = getCountryFacets(shape);
  const language = country.languages[0] ?? "English";
  const currency = country.currencies[0]?.name ?? "moneda-local";
  const facetHref = countryFacetPath(shape, "idioma", language);
  const combinedHref = `${regionPath(country.region)}?idioma=${slugify(language)}&moneda=${slugify(currency)}&subregion=${slugify(country.subregion || "general")}`;

  const facetUrls = facets.slice(0, 6).map((facet) => ({
    label: `${facet.tipo}: ${facet.value}`,
    href: countryFacetPath(shape, facet.tipo, facet.value),
  }));

  const facetCount = facets.length;
  let combinatorialRisk: FacetAnalysis["combinatorialRisk"] = "bajo";
  let riskDetail =
    "Facets predefinidos por atributo único; sin combinaciones libres.";

  if (facetCount > 8) {
    combinatorialRisk = "medio";
    riskDetail = `${facetCount} facets por país; vigilar orphan URLs sin enlazado interno.`;
  }
  if (country.timezones.length > 15) {
    combinatorialRisk = "alto";
    riskDetail = `${country.timezones.length} zonas horarias generan muchas URLs similares.`;
  }

  return {
    countryFacetCount: facetCount,
    facetUrls,
    urlExamples: {
      facet: {
        type: "facet",
        label: "Facet URL (un solo atributo)",
        url: facetHref,
        seoAction: "index",
        note: "Ruta limpia, canonical self-referencing, enlazada desde country-detail.",
      },
      combined: {
        type: "combinado",
        label: "Filtro combinado (query params)",
        url: combinedHref,
        seoAction: "noindex",
        note: "Mezcla idioma + moneda + subregión; riesgo de duplicados y explosión combinatoria.",
      },
    },
    combinatorialRisk,
    riskDetail,
    recommendations: [
      "Indexar solo facets con demanda de búsqueda real (idioma, subregión).",
      "Noindex en combinaciones de filtros (?lang=…&currency=…).",
      "Enlazar facets desde country-detail, no solo desde sitemap.",
      "Usar hubs regionales para distribuir crawl hacia categorías.",
    ],
  };
}

export function runIndexationChecklist(
  sitemap: SitemapBreakdown,
  crawlTiers: UrlTierBreakdown[],
  canonicals: CanonicalExample[]
): IndexationCheck[] {
  const hasRobots = sitemap.robotsSitemap.includes("/sitemap.xml");
  const selfReferencing = canonicals.every(
    (item) => item.pathname === item.canonical
  );
  const tierTotal = crawlTiers.reduce((sum, tier) => sum + tier.count, 0);
  const sitemapCoversMost = sitemap.totalUrls >= tierTotal * 0.5;

  return [
    {
      id: "robots",
      label: "robots.txt expone sitemap",
      passed: hasRobots,
      detail: hasRobots
        ? `Sitemap declarado en ${sitemap.robotsSitemap}`
        : "Falta referencia al sitemap en robots.txt",
    },
    {
      id: "sitemap-size",
      label: "Sitemap cubre inventario principal",
      passed: sitemap.totalUrls > 100,
      detail: `${sitemap.totalUrls} URLs estimadas en sitemap.ts`,
    },
    {
      id: "canonicals",
      label: "Canonicals self-referencing",
      passed: selfReferencing,
      detail: selfReferencing
        ? "Cada tipo de página apunta a su URL limpia"
        : "Revisar canonicals cruzados o ausentes",
    },
    {
      id: "crawl-priority",
      label: "Priorización de crawl definida",
      passed: crawlTiers.length >= 3,
      detail: `${crawlTiers.length} tiers: ${crawlTiers.map((t) => t.label).join(", ")}`,
    },
    {
      id: "dedup",
      label: "Deduplicación en sitemap",
      passed: sitemap.deduplicationNote.includes("Set"),
      detail: sitemap.deduplicationNote,
    },
    {
      id: "coverage",
      label: "Sitemap alineado con tiers de crawl",
      passed: sitemapCoversMost,
      detail: sitemapCoversMost
        ? "El sitemap incluye hubs, países y categorías"
        : "Posible brecha entre URLs generadas e incluidas en sitemap",
    },
  ];
}

export function avgFacetsPerCountry(countries: DemoCountry[]): number {
  if (countries.length === 0) return 6;
  const total = countries.reduce(
    (sum, country) => sum + getCountryFacets(toCountryShape(country)).length,
    0
  );
  return Math.round((total / countries.length) * 10) / 10;
}

export function estimateRegionCategoryCount(
  countryCount: number,
  regionCount: number
): number {
  return Math.round(countryCount * 0.45 + regionCount * GROUP_TYPES.length * 3);
}

export { PAGE_SIZE, slugify, southAmericaLandingPath, regionCategoryHubPath };
