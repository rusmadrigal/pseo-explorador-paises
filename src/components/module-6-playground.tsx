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
import { formatPopulation, type CountryGroupType } from "@/lib/countries";
import {
  getCategoryIntro,
  getCountryCategoryLinks,
  getCountryFacetIntro,
  getCountryIntro,
  getCountryRegionCategoryLinks,
  GROUP_LABELS,
} from "@/lib/seo";
import { countryFacetPath, countryPath, regionPath } from "@/lib/paths";

type DemoCountry = {
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

type DemoSection =
  | "estrategia"
  | "thin-content"
  | "bloques"
  | "escalable"
  | "semantico"
  | "conversion";

const SECTION_LABELS: Record<DemoSection, string> = {
  estrategia: "1) Estrategia de contenido",
  "thin-content": "2) Evitar thin content",
  bloques: "3) Bloques dinámicos",
  escalable: "4) Contenido escalable",
  semantico: "5) SEO semántico",
  conversion: "6) Orientado a conversión",
};

const GROUP_TYPES: CountryGroupType[] = [
  "idioma",
  "moneda",
  "subregion",
  "continente",
  "zona-horaria",
];

export function Module6Playground({ countries }: { countries: DemoCountry[] }) {
  const [activeSection, setActiveSection] = useState<DemoSection>("estrategia");
  const [query, setQuery] = useState("");
  const [groupType, setGroupType] = useState<CountryGroupType>("idioma");
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
    countries.find(
      (country) =>
        country.slug === "united-states" ||
        country.name === "United States" ||
        country.name.includes("United States")
    ) ?? countries[0];

  const selectedCountry = query.trim()
    ? (filtered[0] ?? defaultCountry)
    : defaultCountry;

  const selectedGroupValue = pickGroupValue(selectedCountry, groupType);
  const countryAsLib = toCountryShape(selectedCountry);

  const richIntro = getCountryIntro(countryAsLib);
  const thinIntro = `${selectedCountry.name} es un país.`;
  const categoryIntro = getCategoryIntro(
    groupType,
    selectedGroupValue,
    12,
    87_000_000,
    selectedCountry.region
  );
  const facetIntro = getCountryFacetIntro(
    countryAsLib,
    groupType,
    selectedGroupValue
  );
  const categoryLinks = getCountryCategoryLinks(countryAsLib);
  const regionCategoryLinks = getCountryRegionCategoryLinks(countryAsLib);

  const contentBlocks = buildContentBlocks({
    country: selectedCountry,
    richIntro,
    categoryLinks,
    regionCategoryLinks,
    facetIntro,
    groupType,
    selectedGroupValue,
  });

  const lesson = getLessonData(activeSection, {
    selectedCountry,
    groupType,
    selectedGroupValue,
    richIntro,
    thinIntro,
    categoryIntro,
    facetIntro,
    categoryLinks,
    regionCategoryLinks,
    contentBlocks,
  });

  return (
    <div className="space-y-8">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Laboratorio de clase</CardTitle>
          <CardDescription>
            Elige un país y observa cómo la estrategia de contenido cambia el
            valor SEO de cada URL. Cada bloque se recalcula con datos reales del
            proyecto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            placeholder="Ej: españa, brasil, japón..."
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
            <Badge variant="secondary">
              Caso de estudio: {selectedCountry.name}
            </Badge>
            <Badge variant="outline">Región: {selectedCountry.region}</Badge>
            <Badge variant="outline">
              {GROUP_LABELS[groupType]}: {selectedGroupValue}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista previa en vivo</CardTitle>
              <CardDescription>
                Así se ensambla el contenido programático para{" "}
                {selectedCountry.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contentBlocks.map((block) => (
                <div
                  key={block.id}
                  className="rounded-md border bg-muted/30 p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {block.label}
                  </p>
                  <p className="mt-1 text-muted-foreground">{block.preview}</p>
                  {block.metric && (
                    <Badge variant="outline" className="mt-2">
                      {block.metric}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fuentes del proyecto</CardTitle>
              <CardDescription>
                Archivos reales usados en esta clase.
              </CardDescription>
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
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
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
    flag: "🏳️",
    latlng: [0, 0] as [number, number],
    borders: [] as string[],
  };
}

function countDataPoints(country: DemoCountry): number {
  return (
    5 +
    country.languages.length +
    country.currencies.length +
    country.timezones.length +
    (country.subregion ? 1 : 0)
  );
}

function buildContentBlocks({
  country,
  richIntro,
  categoryLinks,
  regionCategoryLinks,
  facetIntro,
  groupType,
  selectedGroupValue,
}: {
  country: DemoCountry;
  richIntro: string;
  categoryLinks: { label: string; href: string }[];
  regionCategoryLinks: { label: string; href: string }[];
  facetIntro: string;
  groupType: CountryGroupType;
  selectedGroupValue: string;
}) {
  return [
    {
      id: "intro",
      label: "Intro dinámica",
      preview: richIntro,
      metric: `${richIntro.split(" ").length} palabras`,
    },
    {
      id: "stats",
      label: "Bloque de estadísticas",
      preview: `Población: ${formatPopulation(country.population)} · Capital: ${country.capital} · Área: ${new Intl.NumberFormat("es-ES").format(country.area)} km²`,
      metric: "4 métricas únicas",
    },
    {
      id: "facets",
      label: "Atributos del país",
      preview: categoryLinks.map((link) => link.label).join(" · ") || "Sin atributos",
      metric: `${categoryLinks.length} enlaces internos`,
    },
    {
      id: "region",
      label: "Categorías regionales",
      preview:
        regionCategoryLinks.map((link) => link.label).join(" · ") ||
        "Sin categorías",
      metric: `${regionCategoryLinks.length} hubs contextuales`,
    },
    {
      id: "facet-page",
      label: `Página facet (${GROUP_LABELS[groupType]})`,
      preview: facetIntro,
      metric: countryFacetPath(country, groupType, selectedGroupValue),
    },
    {
      id: "cta",
      label: "CTA de conversión",
      preview: `Ver hub regional → ${regionPath(country.region)}`,
      metric: "Navegación profunda",
    },
  ];
}

function getLessonData(
  section: DemoSection,
  context: {
    selectedCountry: DemoCountry;
    groupType: CountryGroupType;
    selectedGroupValue: string;
    richIntro: string;
    thinIntro: string;
    categoryIntro: string;
    facetIntro: string;
    categoryLinks: { label: string; href: string }[];
    regionCategoryLinks: { label: string; href: string }[];
    contentBlocks: { id: string; label: string; preview: string; metric?: string }[];
  }
) {
  const country = context.selectedCountry;
  const dataPoints = countDataPoints(country);
  const richWords = context.richIntro.split(" ").length;
  const thinWords = context.thinIntro.split(" ").length;

  if (section === "estrategia") {
    return {
      title: "Clase 6.1 — Estrategia de contenido programático",
      description:
        "Diseñamos capas de contenido que escalan: hubs regionales, categorías por atributo, perfiles de país y páginas facet.",
      points: [
        `Hub regional: ${regionPath(country.region)}`,
        `Perfil de país: ${countryPath(toCountryShape(country))}`,
        `Facet de ${GROUP_LABELS[context.groupType]}: ${countryFacetPath(country, context.groupType, context.selectedGroupValue)}`,
        "Cada capa responde una intención de búsqueda distinta sin duplicar URLs.",
      ],
      exercise:
        "Actividad: dibuja el embudo de contenido (hub → categoría → país → facet) y asigna una keyword objetivo a cada nivel.",
      code: `Estrategia pSEO de ExploradorMundial:\n\n1. Hub regional     → "países de ${country.region}"\n2. Categoría        → "${context.selectedGroupValue} en ${country.region}"\n3. País             → "${country.name} datos y perfil"\n4. Facet país       → "${country.name} ${GROUP_LABELS[context.groupType]} ${context.selectedGroupValue}"`,
      sources: [
        "src/app/region/[region]/page.tsx",
        "src/app/region/[region]/[segment]/page.tsx",
        "src/app/region/[region]/[segment]/[facet]/[valor]/page.tsx",
        "src/lib/paths.ts",
      ],
      checkQuestion:
        "¿Por qué no basta con generar solo páginas de país sin hubs ni categorías?",
      checkAnswer:
        "Porque pierdes cobertura de long-tail, enlazado interno y autoridad temática; los hubs y categorías capturan intenciones agrupadas y distribuyen PageRank.",
    };
  }

  if (section === "thin-content") {
    return {
      title: "Clase 6.2 — Evitar thin content",
      description:
        "Comparamos contenido mínimo (thin) frente a contenido enriquecido con datos únicos por entidad.",
      points: [
        `Contenido thin: "${context.thinIntro}" (${thinWords} palabras, 0 datos únicos).`,
        `Contenido rico: ${richWords} palabras con ${dataPoints} puntos de datos.`,
        "Google penaliza páginas que no aportan valor diferencial respecto a otras URLs del sitio.",
        "La regla: cada URL debe justificar su existencia con información que no esté en otra página.",
      ],
      exercise:
        "Actividad: cambia entre 3 países y calcula cuántos datos únicos aporta cada intro frente al texto thin.",
      code: `// ❌ Thin content (plantilla vacía)\nconst thin = "${context.thinIntro}";\n\n// ✅ Contenido útil (datos reales)\nconst rich = getCountryIntro(country);\n// → "${context.richIntro}"`,
      sources: [
        "src/lib/seo.ts (getCountryIntro)",
        "src/components/country-detail.tsx",
        "src/lib/countries.ts (formatPopulation, formatArea)",
      ],
      checkQuestion: "¿Qué convierte una página programática en thin content?",
      checkAnswer:
        "Cuando solo cambia el nombre de la entidad pero el texto, datos y utilidad son idénticos o casi vacíos en todas las URLs.",
    };
  }

  if (section === "bloques") {
    return {
      title: "Clase 6.3 — Bloques de contenido dinámico",
      description:
        "Ensamblamos la página con bloques modulares que se activan según los datos disponibles del país.",
      points: [
        `${context.contentBlocks.length} bloques ensamblados para ${country.name}.`,
        "Intro, estadísticas, atributos, categorías regionales y CTAs son bloques independientes.",
        "Si un bloque no tiene datos (ej. sin fronteras), simplemente no se renderiza.",
        "Esto evita thin content y mantiene consistencia visual.",
      ],
      exercise:
        "Actividad: identifica qué bloques del panel derecho cambian al buscar un país distinto.",
      code: context.contentBlocks
        .map(
          (block) =>
            `// ${block.label}\n${block.preview.slice(0, 80)}${block.preview.length > 80 ? "…" : ""}`
        )
        .join("\n\n"),
      sources: [
        "src/components/country-detail.tsx",
        "src/lib/seo.ts (getCountryCategoryLinks)",
        "src/components/country-card.tsx",
      ],
      checkQuestion:
        "¿Por qué usar bloques condicionales en lugar de un párrafo fijo?",
      checkAnswer:
        "Porque cada entidad tiene datos distintos; los bloques condicionales garantizan contenido relevante sin relleno genérico.",
    };
  }

  if (section === "escalable") {
    return {
      title: "Clase 6.4 — Contenido útil y escalable",
      description:
        "Las funciones de intro escalan a miles de URLs insertando variables reales sin intervención manual.",
      points: [
        `getCountryIntro() → intro de país con población, capital e idiomas.`,
        `getCategoryIntro() → intro de categoría con conteo y población agregada.`,
        `getCountryFacetIntro() → intro contextual para facet de país.`,
        "Una sola función alimenta cientos de páginas con datos verificables.",
      ],
      exercise:
        "Actividad: cambia el tipo de agrupación y compara las tres intros generadas automáticamente.",
      code: `// País\n${context.richIntro}\n\n// Categoría regional\n${context.categoryIntro}\n\n// Facet de país\n${context.facetIntro}`,
      sources: [
        "src/lib/seo.ts",
        "src/app/region/[region]/[segment]/[facet]/page.tsx",
        "src/app/region/[region]/[segment]/[facet]/[valor]/page.tsx",
      ],
      checkQuestion:
        "¿Qué diferencia hay entre contenido escalable y contenido duplicado?",
      checkAnswer:
        "El escalable usa plantillas con variables únicas por entidad; el duplicado repite el mismo texto cambiando solo una palabra.",
    };
  }

  if (section === "semantico") {
    const semanticLinks = [
      ...context.categoryLinks.slice(0, 3),
      ...context.regionCategoryLinks.slice(0, 2),
    ];
    return {
      title: "Clase 6.5 — SEO semántico",
      description:
        "Conectamos entidades (país, región, idioma, moneda) con enlaces internos que refuerzan la comprensión temática.",
      points: [
        `${context.categoryLinks.length} enlaces semánticos desde atributos del país.`,
        `${context.regionCategoryLinks.length} enlaces hacia categorías regionales relacionadas.`,
        "Cada enlace usa anchor text descriptivo (ej. «Idioma: Spanish»), no «click aquí».",
        "La malla interna distribuye autoridad y ayuda a Google a mapear el grafo de entidades.",
      ],
      exercise:
        "Actividad: elige un país y traza 3 saltos de enlazado interno hasta llegar a un hub regional.",
      code: semanticLinks
        .map((link) => `<Link href="${link.href}">${link.label}</Link>`)
        .join("\n"),
      sources: [
        "src/lib/seo.ts (getCountryCategoryLinks, getCountryRegionCategoryLinks)",
        "src/components/country-detail.tsx (GroupedLinkList)",
        "src/components/breadcrumbs.tsx",
      ],
      checkQuestion: "¿Cómo contribuye el SEO semántico al pSEO?",
      checkAnswer:
        "Al definir relaciones entre entidades (país ↔ idioma ↔ región), Google entiende el sitio como un grafo de conocimiento, no como páginas aisladas.",
    };
  }

  return {
    title: "Clase 6.6 — Contenido orientado a conversión",
    description:
      "Cada bloque de contenido incluye CTAs que guían al usuario hacia la siguiente acción: explorar, comparar o profundizar.",
    points: [
      "Badges clicables en atributos → navegación a facets.",
      "«Ver hub regional →» convierte lectores pasivos en exploradores activos.",
      "CountryCard en secciones relacionadas fomenta descubrimiento cruzado.",
      "El objetivo no es solo rankear, sino retener y mover al usuario por el sitio.",
    ],
    exercise:
      "Actividad: propón un CTA adicional para la página de país que impulse visitas a categorías de idioma.",
    code: `// CTAs de conversión en country-detail.tsx\n<Link href="${regionPath(country.region)}">\n  Ver hub regional →\n</Link>\n\n<Link href="${countryFacetPath(country, context.groupType, context.selectedGroupValue)}">\n  ${GROUP_LABELS[context.groupType]}: ${context.selectedGroupValue}\n</Link>\n\n// Tarjetas de países relacionados\n<CountryCard country={relatedCountry} />`,
    sources: [
      "src/components/country-detail.tsx",
      "src/components/country-card.tsx",
      "src/app/region/[region]/[segment]/page.tsx",
    ],
    checkQuestion:
      "¿Por qué el pSEO necesita CTAs si el tráfico viene de búsqueda orgánica?",
    checkAnswer:
      "Porque el tráfico orgánico sin engagement genera rebote alto; los CTAs convierten visitas en sesiones profundas, señal positiva para SEO y negocio.",
  };
}
