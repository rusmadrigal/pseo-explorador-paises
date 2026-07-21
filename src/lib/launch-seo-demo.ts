import { countryPath, regionCategoryPath, regionPath } from "@/lib/paths";
import { estimateSitemapBreakdown, type DemoCountry } from "@/lib/technical-seo-demo";

export type { DemoCountry };

export interface LaunchCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  file?: string;
}

export interface DeployStep {
  order: number;
  title: string;
  command?: string;
  detail: string;
}

export interface TemplateKpi {
  template: string;
  exampleUrl: string;
  indexedEstimate: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
}

export interface SearchConsoleSnapshot {
  siteUrl: string;
  sitemapUrl: string;
  totalIndexed: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  templates: TemplateKpi[];
  insight: string;
}

export interface PipelineStep {
  module: string;
  title: string;
  output: string;
  href?: string;
}

export interface CapstoneTask {
  id: string;
  task: string;
  deliverable: string;
  done: boolean;
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://world-explorer.vercel.app";
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function buildGoLiveChecklist(
  countryCount: number,
  sitemapUrlCount: number
): LaunchCheckItem[] {
  const siteUrl = getSiteUrl();

  return [
    {
      id: "env",
      label: "NEXT_PUBLIC_SITE_URL configurada",
      passed: Boolean(process.env.NEXT_PUBLIC_SITE_URL) || siteUrl.includes("vercel"),
      detail: `Canonical y sitemap usan ${siteUrl}`,
      file: ".env / Vercel dashboard",
    },
    {
      id: "build",
      label: "Build de producción sin errores",
      passed: true,
      detail: "npm run build genera todas las rutas estáticas",
      file: "package.json",
    },
    {
      id: "sitemap",
      label: "Sitemap accesible",
      passed: sitemapUrlCount > 100,
      detail: `${sitemapUrlCount} URLs en /sitemap.xml`,
      file: "src/app/sitemap.ts",
    },
    {
      id: "robots",
      label: "robots.txt referencia el sitemap",
      passed: true,
      detail: `Sitemap: ${siteUrl}/sitemap.xml`,
      file: "src/app/robots.ts",
    },
    {
      id: "canonicals",
      label: "Canonicals en plantillas dinámicas",
      passed: true,
      detail: "generateMetadata → alternates.canonical por ruta",
      file: "src/app/region/[region]/[segment]/page.tsx",
    },
    {
      id: "404",
      label: "Página 404 personalizada",
      passed: true,
      detail: "Rutas inválidas devuelven not-found.tsx",
      file: "src/app/not-found.tsx",
    },
    {
      id: "gsc",
      label: "Propiedad en Search Console",
      passed: false,
      detail: "Acción manual post-deploy: verificar dominio y enviar sitemap",
      file: "search.google.com/search-console",
    },
    {
      id: "sample",
      label: "Muestra de URLs publicadas",
      passed: countryCount >= 200,
      detail: `${countryCount} perfiles de país listos para indexación`,
      file: "src/data/countries.json",
    },
  ];
}

export function buildDeploySteps(): DeployStep[] {
  return [
    {
      order: 1,
      title: "Variables de entorno",
      detail:
        "Define NEXT_PUBLIC_SITE_URL y RESTCOUNTRIES_API_KEY (opcional) en Vercel.",
    },
    {
      order: 2,
      title: "Deploy a producción",
      command: "vercel --prod",
      detail: "Next.js genera sitemap.xml y robots.txt en el build.",
    },
    {
      order: 3,
      title: "Verificar rutas críticas",
      command: "curl -I $SITE_URL/sitemap.xml",
      detail: "Comprueba 200 en /, /sitemap.xml y una URL de país.",
    },
    {
      order: 4,
      title: "Search Console",
      detail:
        "Añade la propiedad, verifica dominio y envía el sitemap declarado en robots.txt.",
    },
    {
      order: 5,
      title: "Monitoreo inicial (7–14 días)",
      detail:
        "Revisa cobertura e indexación antes de escalar nuevas plantillas o facets.",
    },
  ];
}

export function buildSearchConsoleSnapshot(
  country: DemoCountry,
  countryCount: number,
  regionCount: number,
  sitemapUrlCount: number
): SearchConsoleSnapshot {
  const siteUrl = getSiteUrl();
  const seed = hashString(country.slug);
  const shape = {
    region: country.region,
    slug: country.slug,
  };

  const templates: TemplateKpi[] = [
    {
      template: "Perfil de país",
      exampleUrl: countryPath(shape),
      indexedEstimate: Math.round(countryCount * 0.72),
      impressions: 1200 + (seed % 800),
      clicks: 48 + (seed % 40),
      ctr: 3.2 + (seed % 20) / 10,
      avgPosition: 8 + (seed % 12),
    },
    {
      template: "Hub regional",
      exampleUrl: regionPath(country.region),
      indexedEstimate: regionCount,
      impressions: 900 + (seed % 500),
      clicks: 72 + (seed % 30),
      ctr: 5.1 + (seed % 15) / 10,
      avgPosition: 6 + (seed % 8),
    },
    {
      template: "Categoría regional",
      exampleUrl: regionCategoryPath(
        country.region,
        "idioma",
        country.languages[0] ?? "English"
      ),
      indexedEstimate: Math.round(countryCount * 0.35),
      impressions: 600 + (seed % 400),
      clicks: 24 + (seed % 20),
      ctr: 2.8 + (seed % 12) / 10,
      avgPosition: 11 + (seed % 10),
    },
    {
      template: "Facet de país",
      exampleUrl: `${countryPath(shape)}/idioma/${(country.languages[0] ?? "english").toLowerCase().replace(/\s+/g, "-")}`,
      indexedEstimate: Math.round(countryCount * 0.28),
      impressions: 350 + (seed % 250),
      clicks: 12 + (seed % 15),
      ctr: 2.1 + (seed % 10) / 10,
      avgPosition: 14 + (seed % 9),
    },
  ];

  const totalImpressions = templates.reduce((sum, t) => sum + t.impressions, 0);
  const totalClicks = templates.reduce((sum, t) => sum + t.clicks, 0);
  const totalIndexed = Math.min(
    sitemapUrlCount,
    templates.reduce((sum, t) => sum + t.indexedEstimate, 0)
  );

  const best = [...templates].sort((a, b) => b.ctr - a.ctr)[0];

  return {
    siteUrl,
    sitemapUrl: `${siteUrl}/sitemap.xml`,
    totalIndexed,
    totalImpressions,
    totalClicks,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    templates,
    insight: `Mejor CTR simulado: ${best.template} (${best.ctr.toFixed(1)}%). Prioriza enlazado interno hacia plantillas con demanda real.`,
  };
}

export function buildPipelineRecap(): PipelineStep[] {
  return [
    {
      module: "Mód. 1–4",
      title: "Fundamentos y arquitectura",
      output: "Estrategia pSEO, datos (REST Countries) y rutas escalables",
    },
    {
      module: "Mód. 5",
      title: "Templates escalables",
      output: "Metadata, schema, layout y componentes reutilizables",
      href: "/modulo-5",
    },
    {
      module: "Mód. 6",
      title: "Contenido programático",
      output: "Bloques dinámicos, thin content, SEO semántico y CTAs",
      href: "/modulo-6",
    },
    {
      module: "Mód. 7",
      title: "IA para pSEO",
      output: "Prompts escalables, anti-duplicación y QA manual",
      href: "/modulo-7",
    },
    {
      module: "Mód. 8",
      title: "Technical SEO",
      output: "Indexación, sitemap, canonicals y faceted navigation",
      href: "/modulo-8",
    },
    {
      module: "Mód. 9",
      title: "De build a tráfico",
      output: "Deploy, Search Console y proyecto final",
      href: "/modulo-9",
    },
  ];
}

export function buildCapstoneTasks(): CapstoneTask[] {
  return [
    {
      id: "niche",
      task: "Elige un nicho y dataset propio",
      deliverable: "1 fuente de datos estructurada (API, CSV o CMS)",
      done: false,
    },
    {
      id: "keywords",
      task: "Define 10–20 URLs objetivo",
      deliverable: "Patrón de URL + keyword target por plantilla",
      done: false,
    },
    {
      id: "template",
      task: "Implementa 1 plantilla Next.js",
      deliverable: "generateStaticParams + generateMetadata + JSON-LD",
      done: false,
    },
    {
      id: "content",
      task: "Añade capa de contenido",
      deliverable: "Intro con datos reales o IA con QA (Mód. 6–7)",
      done: false,
    },
    {
      id: "technical",
      task: "Cierra technical SEO",
      deliverable: "sitemap.ts, robots.ts y canonicals (Mód. 8)",
      done: false,
    },
    {
      id: "launch",
      task: "Publica y mide",
      deliverable: "Deploy + Search Console + revisión a los 14 días",
      done: false,
    },
  ];
}

export function estimateSitemapUrlCount(
  countryCount: number,
  regionCount: number,
  avgFacetsPerCountry: number
): number {
  return estimateSitemapBreakdown(
    countryCount,
    regionCount,
    avgFacetsPerCountry,
    Math.round(countryCount * 0.45 + regionCount * 15)
  ).totalUrls;
}
