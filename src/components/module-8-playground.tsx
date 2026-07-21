"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type CountryGroupType } from "@/lib/countries";
import { GROUP_LABELS } from "@/lib/seo";
import {
  analyzeFacetedNavigation,
  avgFacetsPerCountry,
  buildCrawlBudgetTiers,
  buildPaginationPreview,
  estimateRegionCategoryCount,
  estimateSitemapBreakdown,
  getCanonicalExamples,
  runIndexationChecklist,
  type DemoCountry,
} from "@/lib/technical-seo-demo";

type DemoSection =
  | "indexacion"
  | "crawl-budget"
  | "sitemap"
  | "canonicals"
  | "pagination"
  | "faceted-nav";

const SECTION_LABELS: Record<DemoSection, string> = {
  indexacion: "1) Indexación",
  "crawl-budget": "2) Crawl budget",
  sitemap: "3) Sitemap dinámico",
  canonicals: "4) Canonicals",
  pagination: "5) Pagination",
  "faceted-nav": "6) Faceted navigation",
};

const GROUP_TYPES: CountryGroupType[] = [
  "idioma",
  "moneda",
  "subregion",
  "continente",
  "zona-horaria",
];

export function Module8Playground({
  countries,
  totalCountryCount,
  regionCount,
}: {
  countries: DemoCountry[];
  totalCountryCount: number;
  regionCount: number;
}) {
  const [activeSection, setActiveSection] = useState<DemoSection>("indexacion");
  const [query, setQuery] = useState("");
  const [groupType, setGroupType] = useState<CountryGroupType>("idioma");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.capital.toLowerCase().includes(q) ||
        country.region.toLowerCase().includes(q)
    );
  }, [countries, query]);

  const defaultCountry =
    countries.find((country) => country.slug === "united-states") ??
    countries[0];

  const selectedCountry = query.trim()
    ? (filtered[0] ?? defaultCountry)
    : defaultCountry;

  const selectedGroupValue = pickGroupValue(selectedCountry, groupType);
  const avgFacets = avgFacetsPerCountry(countries);
  const regionCategoryCount = estimateRegionCategoryCount(
    totalCountryCount,
    regionCount
  );

  const sitemapBreakdown = estimateSitemapBreakdown(
    totalCountryCount,
    regionCount,
    avgFacets,
    regionCategoryCount
  );
  const crawlTiers = buildCrawlBudgetTiers(totalCountryCount, regionCount);
  const canonicalExamples = getCanonicalExamples(selectedCountry);
  const regionCountries = countries.filter(
    (country) => country.region === selectedCountry.region
  );
  const paginationPreview = buildPaginationPreview(
    selectedCountry.region,
    groupType,
    selectedGroupValue,
    regionCountries.map((country) => country.name),
    currentPage
  );
  const facetAnalysis = analyzeFacetedNavigation(selectedCountry);
  const indexationChecks = runIndexationChecklist(
    sitemapBreakdown,
    crawlTiers,
    canonicalExamples
  );
  const indexationPassed = indexationChecks.filter((item) => item.passed).length;

  const lesson = getLessonData(activeSection, {
    selectedCountry,
    groupType,
    selectedGroupValue,
    totalCountryCount,
    regionCount,
    sitemapBreakdown,
    crawlTiers,
    canonicalExamples,
    paginationPreview,
    facetAnalysis,
    indexationChecks,
    indexationPassed,
  });

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Nota para la clase:</strong> los
          módulos 5–7 cubrieron templates, contenido e IA. Aquí cerramos el
          ciclo con{" "}
          <strong className="text-foreground">Technical SEO</strong>: cómo hacer
          que Google descubra, rastree e indexe cientos de URLs sin desperdiciar
          crawl budget ni generar duplicados. El cierre del curso continúa en el{" "}
          <a href="/modulo-9" className="underline underline-offset-2">
            Módulo 9
          </a>
          .
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Laboratorio de clase</CardTitle>
          <CardDescription>
            Explora indexación, crawl budget, sitemap, canonicals, paginación y
            navegación facetada con datos reales de ExploradorMundial (
            {totalCountryCount} países, {regionCount} regiones).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            placeholder="Ej: estados unidos, méxico, brasil..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {GROUP_TYPES.map((type) => (
              <Button
                key={type}
                variant={groupType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupType(type)}
              >
                {GROUP_LABELS[type]}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">País: {selectedCountry.name}</Badge>
            <Badge variant="outline">
              {sitemapBreakdown.totalUrls} URLs en sitemap
            </Badge>
            <Badge variant="outline">
              {indexationPassed}/{indexationChecks.length} checks OK
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(SECTION_LABELS) as DemoSection[]).map((section) => (
          <Button
            key={section}
            variant={activeSection === section ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveSection(section);
              setShowAnswer(false);
            }}
          >
            {SECTION_LABELS[section]}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TeachingCard
          title={lesson.title}
          description={lesson.description}
          points={lesson.points}
          exercise={lesson.exercise}
          code={lesson.code}
        />

        <div className="space-y-6">
          <LivePanel
            activeSection={activeSection}
            sitemapBreakdown={sitemapBreakdown}
            crawlTiers={crawlTiers}
            canonicalExamples={canonicalExamples}
            paginationPreview={paginationPreview}
            facetAnalysis={facetAnalysis}
            indexationChecks={indexationChecks}
            indexationPassed={indexationPassed}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fuentes del proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {lesson.sources.map((source) => (
                <div
                  key={source}
                  className="rounded-md bg-muted px-3 py-2 font-mono text-xs"
                >
                  {source}
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pregunta de comprobación
                </p>
                <p className="text-sm">{lesson.checkQuestion}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswer((value) => !value)}
                >
                  {showAnswer ? "Ocultar respuesta" : "Mostrar respuesta"}
                </Button>
                {showAnswer && (
                  <p className="rounded-md border border-primary/30 bg-primary/5 p-2 text-sm">
                    {lesson.checkAnswer}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LivePanel({
  activeSection,
  sitemapBreakdown,
  crawlTiers,
  canonicalExamples,
  paginationPreview,
  facetAnalysis,
  indexationChecks,
  indexationPassed,
  currentPage,
  onPageChange,
}: {
  activeSection: DemoSection;
  sitemapBreakdown: ReturnType<typeof estimateSitemapBreakdown>;
  crawlTiers: ReturnType<typeof buildCrawlBudgetTiers>;
  canonicalExamples: ReturnType<typeof getCanonicalExamples>;
  paginationPreview: ReturnType<typeof buildPaginationPreview>;
  facetAnalysis: ReturnType<typeof analyzeFacetedNavigation>;
  indexationChecks: ReturnType<typeof runIndexationChecklist>;
  indexationPassed: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  if (activeSection === "indexacion") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checklist de indexación</CardTitle>
          <CardDescription>
            {indexationPassed}/{indexationChecks.length} aprobados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {indexationChecks.map((item) => (
            <div
              key={item.id}
              className={`rounded-md border p-3 text-sm ${
                item.passed
                  ? "border-primary/30 bg-primary/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <p className="font-medium">
                {item.passed ? "✓" : "✗"} {item.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "crawl-budget") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tiers de crawl budget</CardTitle>
          <CardDescription>
            Prioriza qué URLs deben recibir enlaces internos primero
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {crawlTiers.map((tier) => (
            <div key={tier.tier} className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{tier.label}</p>
                <Badge variant="outline">{tier.count} URLs</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {tier.crawlPriority}
              </p>
              <p className="mt-2 font-mono text-xs">
                {tier.examples.join(" · ")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "sitemap") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sitemap dinámico</CardTitle>
          <CardDescription>
            {sitemapBreakdown.totalUrls} URLs · {sitemapBreakdown.robotsSitemap}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {sitemapBreakdown.segments.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center justify-between rounded-md border bg-muted/30 p-3"
            >
              <span>{segment.label}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{segment.count}</Badge>
                <Badge variant="outline">p={segment.priority}</Badge>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {sitemapBreakdown.deduplicationNote}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "canonicals") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Canonicals por tipo de página</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {canonicalExamples.map((item) => (
            <div key={item.pageType} className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {item.pageType}
              </p>
              <p className="mt-1 font-mono text-xs">{item.canonical}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "pagination") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paginación simulada</CardTitle>
          <CardDescription>
            {paginationPreview.basePath} · página {paginationPreview.currentPage}{" "}
            de {paginationPreview.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!paginationPreview.prevUrl}
              onClick={() => onPageChange(currentPage - 1)}
            >
              ← Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!paginationPreview.nextUrl}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Siguiente →
            </Button>
          </div>
          <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Mostrando {paginationPreview.visibleItems.length} de{" "}
            {paginationPreview.totalItems} países (pageSize=
            {paginationPreview.pageSize})
          </p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground">
            {paginationPreview.visibleItems.slice(0, 5).map((name) => (
              <li key={name}>{name}</li>
            ))}
            {paginationPreview.visibleItems.length > 5 && <li>…</li>}
          </ul>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {paginationPreview.relTags.join("\n")}
          </pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Faceted navigation</CardTitle>
        <CardDescription>
          {facetAnalysis.countryFacetCount} facets · riesgo{" "}
          {facetAnalysis.combinatorialRisk}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
          {facetAnalysis.riskDetail}
        </p>

        <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-primary">
              {facetAnalysis.urlExamples.facet.label}
            </p>
            <Badge variant="secondary">index</Badge>
          </div>
          <p className="mt-1 font-mono text-xs">{facetAnalysis.urlExamples.facet.url}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {facetAnalysis.urlExamples.facet.note}
          </p>
        </div>

        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-destructive">
              {facetAnalysis.urlExamples.combined.label}
            </p>
            <Badge variant="destructive">noindex</Badge>
          </div>
          <p className="mt-1 font-mono text-xs break-all">
            {facetAnalysis.urlExamples.combined.url}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {facetAnalysis.urlExamples.combined.note}
          </p>
        </div>

        {facetAnalysis.facetUrls.map((facet) => (
          <div key={facet.href} className="rounded-md border bg-muted/30 p-3">
            <p className="font-medium">{facet.label}</p>
            <p className="mt-1 font-mono text-xs">{facet.href}</p>
          </div>
        ))}
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {facetAnalysis.recommendations.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TeachingCard({
  title,
  description,
  points,
  exercise,
  code,
}: {
  title: string;
  description: string;
  points: string[];
  exercise: string;
  code: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <Separator />
        <div className="rounded-md border border-dashed p-3 text-xs">
          <p className="font-medium">Actividad guiada</p>
          <p className="mt-1 text-muted-foreground">{exercise}</p>
        </div>
        <Separator />
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap">
          {code}
        </pre>
      </CardContent>
    </Card>
  );
}

function pickGroupValue(country: DemoCountry, groupType: CountryGroupType): string {
  switch (groupType) {
    case "idioma":
      return country.languages[0] ?? "idioma-principal";
    case "moneda":
      return country.currencies[0]?.name ?? "moneda-local";
    case "subregion":
      return country.subregion || "subregión";
    case "continente":
      return country.continent;
    case "zona-horaria":
      return country.timezones[0] ?? "UTC";
    default:
      return "valor";
  }
}

function getLessonData(
  section: DemoSection,
  ctx: {
    selectedCountry: DemoCountry;
    groupType: CountryGroupType;
    selectedGroupValue: string;
    totalCountryCount: number;
    regionCount: number;
    sitemapBreakdown: ReturnType<typeof estimateSitemapBreakdown>;
    crawlTiers: ReturnType<typeof buildCrawlBudgetTiers>;
    canonicalExamples: ReturnType<typeof getCanonicalExamples>;
    paginationPreview: ReturnType<typeof buildPaginationPreview>;
    facetAnalysis: ReturnType<typeof analyzeFacetedNavigation>;
    indexationChecks: ReturnType<typeof runIndexationChecklist>;
    indexationPassed: number;
  }
) {
  const country = ctx.selectedCountry;

  if (section === "indexacion") {
    return {
      title: "Clase 8.1 — Indexación en pSEO",
      description:
        "Generar URLs no garantiza tráfico: Google debe descubrirlas, rastrearlas e indexarlas. En pSEO esto exige robots.txt, sitemap, canonicals y enlazado interno coherente.",
      points: [
        `${ctx.indexationPassed}/${ctx.indexationChecks.length} checks de indexación pasados en ExploradorMundial.`,
        "Pipeline: publicación → sitemap → crawl → indexación → impresiones.",
        "Search Console monitoriza cobertura; el sitemap acelera descubrimiento.",
        "URLs huérfanas (solo en sitemap, sin enlaces) indexan peor.",
      ],
      exercise:
        "Actividad: revisa el checklist del panel y marca qué archivo del proyecto resuelve cada check.",
      code: `// robots.ts\nsitemap: "${ctx.sitemapBreakdown.robotsSitemap}"\n\n// sitemap.ts → ${ctx.sitemapBreakdown.totalUrls} URLs\n// generateMetadata → alternates.canonical\n// country-detail → enlaces internos a facets`,
      sources: [
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/app/region/[region]/[segment]/page.tsx",
      ],
      checkQuestion: "¿Qué diferencia hay entre rastrear e indexar?",
      checkAnswer:
        "Rastrear es que Googlebot visita la URL; indexar es que la almacena en el índice y puede mostrarla en resultados. Una URL puede rastrearse sin indexarse.",
    };
  }

  if (section === "crawl-budget") {
    const totalCrawl = ctx.crawlTiers.reduce((sum, tier) => sum + tier.count, 0);
    return {
      title: "Clase 8.2 — Crawl budget",
      description:
        "Con cientos de URLs, Google asigna un presupuesto de rastreo finito. Prioriza hubs y perfiles de país antes que combinaciones profundas.",
      points: [
        `~${totalCrawl} URLs estimadas en ${ctx.crawlTiers.length} tiers de prioridad.`,
        `Tier crítico: home + ${ctx.regionCount} hubs regionales.`,
        `${ctx.totalCountryCount} perfiles de país en tier alto (priority 0.8).`,
        "Facets y categorías se descubren mejor vía enlazado interno que solo vía sitemap.",
      ],
      exercise:
        "Actividad: ordena los 4 tiers del panel de mayor a menor prioridad de enlazado interno.",
      code: ctx.crawlTiers
        .map(
          (tier) =>
            `// ${tier.label} (${tier.count} URLs)\n// ${tier.crawlPriority}`
        )
        .join("\n\n"),
      sources: [
        "src/app/sitemap.ts (priority por segmento)",
        "src/components/country-detail.tsx (enlaces a facets)",
        "src/app/region/[region]/page.tsx (hub regional)",
      ],
      checkQuestion: "¿Por qué el crawl budget importa más en pSEO que en un sitio de 20 páginas?",
      checkAnswer:
        "Porque al escalar a cientos o miles de URLs compites por un presupuesto de rastreo limitado; sin priorización, Google puede dejar sin rastrear páginas importantes.",
    };
  }

  if (section === "sitemap") {
    return {
      title: "Clase 8.3 — Sitemap dinámico",
      description:
        "sitemap.ts genera el inventario completo en build time a partir de getAllCountries() y facets, con prioridades por tipo de página.",
      points: [
        `${ctx.sitemapBreakdown.totalUrls} URLs en el sitemap dinámico.`,
        ...ctx.sitemapBreakdown.segments.slice(0, 3).map(
          (s) => `${s.label}: ${s.count} URLs (priority ${s.priority})`
        ),
        "Deduplicación con Set evita URLs repetidas por solapamiento de facets.",
        "robots.txt apunta a /sitemap.xml para acelerar descubrimiento.",
      ],
      exercise:
        "Actividad: abre sitemap.ts e identifica qué segmentos generan más URLs.",
      code: `// src/app/sitemap.ts\nexport default async function sitemap() {\n  const countries = await getAllCountries();\n  // home + regiones + países + facets + categorías\n  // dedup con Set antes de return\n}`,
      sources: [
        "src/app/sitemap.ts",
        "src/app/robots.ts",
        "src/lib/paths.ts",
      ],
      checkQuestion: "¿El sitemap garantiza indexación?",
      checkAnswer:
        "No. Solo sugiere URLs a rastrear. La indexación depende de calidad, canonicals, duplicados y señales de enlazado interno.",
    };
  }

  if (section === "canonicals") {
    return {
      title: "Clase 8.4 — Canonicals",
      description:
        "Cada plantilla pSEO debe declarar una URL canónica única vía generateMetadata → alternates.canonical.",
      points: [
        `${ctx.canonicalExamples.length} tipos de página con canonical self-referencing.`,
        `País ${country.name}: ${ctx.canonicalExamples[0]?.canonical}`,
        "Evita canibalización entre rutas legacy (/country/[slug]) y nuevas (/region/...).",
        "Canonical limpio sin query params en facets; paginación usa canonical por página.",
      ],
      exercise:
        "Actividad: compara el canonical de país vs categoría regional para el mismo idioma.",
      code: ctx.canonicalExamples
        .map(
          (item) =>
            `// ${item.pageType}\nalternates: { canonical: "${item.canonical}" }`
        )
        .join("\n\n"),
      sources: [
        "src/app/region/[region]/[segment]/page.tsx",
        "src/app/region/[region]/[segment]/[facet]/page.tsx",
        "src/app/region/[region]/[segment]/[facet]/[valor]/page.tsx",
      ],
      checkQuestion: "¿Cuándo usar canonical en pSEO?",
      checkAnswer:
        "Siempre que una entidad tenga una URL principal: perfiles, facets, categorías y páginas paginadas. Consolida señales y evita duplicados por parámetros o rutas alternativas.",
    };
  }

  if (section === "pagination") {
    return {
      title: "Clase 8.5 — Pagination",
      description:
        "Listados largos (categorías regionales con decenas de países) deben paginarse con rel=prev/next y canonical por página.",
      points: [
        `Simulación: ${ctx.paginationPreview.totalItems} países en ${ctx.paginationPreview.totalPages} páginas.`,
        `pageSize=${ctx.paginationPreview.pageSize}; página actual: ${ctx.paginationPreview.currentPage}.`,
        "Canonical apunta a la URL de la página actual, no siempre a la página 1.",
        "rel=prev/next ayuda a Google a entender la secuencia sin tratar cada página como duplicado.",
      ],
      exercise:
        "Actividad: navega entre páginas en el panel y observa cómo cambian prev, next y canonical.",
      code: ctx.paginationPreview.relTags.join("\n"),
      sources: [
        "src/app/region/[region]/[segment]/[facet]/page.tsx (listado sin paginar aún)",
        "src/lib/technical-seo-demo.ts (buildPaginationPreview)",
      ],
      checkQuestion: "¿Por qué no paginar con JavaScript infinito en pSEO?",
      checkAnswer:
        "Porque cada página paginada es una URL indexable con intención de búsqueda propia; el scroll infinito oculta URLs que Google no puede descubrir ni rankear individualmente.",
    };
  }

  return {
    title: "Clase 8.6 — Faceted navigation",
    description:
      "Los facets (idioma, moneda, subregión) multiplican URLs. Sin control, explota el crawl budget y aparecen duplicados.",
    points: [
      `${ctx.facetAnalysis.countryFacetCount} facets para ${country.name}.`,
      `Riesgo combinatorio: ${ctx.facetAnalysis.combinatorialRisk}.`,
      `✓ Indexar: ${ctx.facetAnalysis.urlExamples.facet.url}`,
      `✗ Noindex: ${ctx.facetAnalysis.urlExamples.combined.url}`,
      ctx.facetAnalysis.riskDetail,
    ],
    exercise:
      "Actividad: compara las dos URLs del panel. ¿Por qué la facet URL sí indexa y la combinada no?",
    code: `// ✅ Facet URL (index)\n${ctx.facetAnalysis.urlExamples.facet.url}\n// ${ctx.facetAnalysis.urlExamples.facet.note}\n\n// ❌ Filtro combinado (noindex)\n${ctx.facetAnalysis.urlExamples.combined.url}\n// ${ctx.facetAnalysis.urlExamples.combined.note}`,
    sources: [
      "src/lib/countries.ts (getCountryFacets)",
      "src/lib/paths.ts (countryFacetPath)",
      "src/components/country-detail.tsx (GroupedLinkList)",
    ],
    checkQuestion: "¿Qué diferencia hay entre facet URL y filtro combinado?",
    checkAnswer:
      "Un facet URL es una página con un solo atributo (ej. idioma: English). Un filtro combinado mezcla varios parámetros (?lang=…&currency=…) y genera explosión combinatoria; suele noindex o canonical al hub.",
  };
}
