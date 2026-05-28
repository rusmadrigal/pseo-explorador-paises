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
import { slugify, type CountryGroupType } from "@/lib/countries";
import {
  buildBreadcrumbJsonLd,
  getCategoryIntro,
} from "@/lib/seo";
import { countryFacetPath, countryPath, regionCategoryPath } from "@/lib/paths";

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
};

type DemoSection =
  | "template"
  | "metadata"
  | "schema"
  | "layout"
  | "componentes";

const SECTION_LABELS: Record<DemoSection, string> = {
  template: "1) Template reutilizable",
  metadata: "2) Metadata dinamica",
  schema: "3) Schema dinamico",
  layout: "4) Layout escalable",
  componentes: "5) Componentes reutilizables",
};

const GROUP_TYPES: CountryGroupType[] = [
  "idioma",
  "moneda",
  "subregion",
  "continente",
  "zona-horaria",
];

export function Module5Playground({ countries }: { countries: DemoCountry[] }) {
  const [activeSection, setActiveSection] = useState<DemoSection>("template");
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
    ? filtered[0] ?? defaultCountry
    : defaultCountry;
  const selectedGroupValue = pickGroupValue(selectedCountry, groupType);
  const simulatedRoute = countryFacetPath(
    selectedCountry,
    groupType,
    selectedGroupValue
  );
  const simulatedCategoryRoute = regionCategoryPath(
    selectedCountry.region,
    groupType,
    selectedGroupValue
  );

  const dynamicDescription = getCategoryIntro(
    groupType,
    selectedGroupValue,
    12,
    87_000_000,
    selectedCountry.region
  );

  const dynamicMetadata = {
    title: `${selectedCountry.name} - ${groupType}: ${selectedGroupValue}`,
    description: dynamicDescription,
    alternates: {
      canonical: simulatedRoute,
    },
    openGraph: {
      title: `${selectedCountry.name} en WorldExplorer`,
      url: simulatedRoute,
    },
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: selectedCountry.region, href: `/region/${slugify(selectedCountry.region)}` },
    { label: selectedCountry.name },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  const countryJsonLd = {
    "@context": "https://schema.org",
    "@type": "Country",
    name: selectedCountry.name,
    description: `${selectedCountry.name} es un pais de ${selectedCountry.region} con capital en ${selectedCountry.capital}.`,
    containedInPlace: {
      "@type": "Continent",
      name: selectedCountry.continent,
    },
  };

  const lesson = getLessonData(activeSection, {
    selectedCountry,
    groupType,
    selectedGroupValue,
    simulatedRoute,
    simulatedCategoryRoute,
    dynamicMetadata,
    countryJsonLd,
    breadcrumbJsonLd,
  });

  return (
    <div className="space-y-8">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Laboratorio de clase</CardTitle>
          <CardDescription>
            Elige un pais y un tipo de agrupacion. El contenido de cada clase
            se recalcula en tiempo real con ese contexto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            placeholder="Ej: australia, mexico, argentina..."
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
                {type}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              Caso de estudio: {selectedCountry.name}
            </Badge>
            <Badge variant="outline">Region: {selectedCountry.region}</Badge>
            <Badge variant="outline">Facet: {groupType}</Badge>
            <Badge variant="outline">Valor: {selectedGroupValue}</Badge>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fuentes de la informacion</CardTitle>
            <CardDescription>
              Recursos reales del proyecto usados en esta clase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {lesson.sources.map((source) => (
              <div key={source} className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
                {source}
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pregunta de comprobacion
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
      return country.subregion || "subregion";
    case "continente":
      return country.continent;
    case "zona-horaria":
      return country.timezones[0] ?? "utc";
    default:
      return "valor";
  }
}

function getLessonData(
  section: DemoSection,
  context: {
    selectedCountry: DemoCountry;
    groupType: CountryGroupType;
    selectedGroupValue: string;
    simulatedRoute: string;
    simulatedCategoryRoute: string;
    dynamicMetadata: {
      title: string;
      description: string;
      alternates: { canonical: string };
      openGraph: { title: string; url: string };
    };
    countryJsonLd: Record<string, unknown>;
    breadcrumbJsonLd: Record<string, unknown>;
  }
): {
  title: string;
  description: string;
  points: string[];
  exercise: string;
  code: string;
  sources: string[];
  checkQuestion: string;
  checkAnswer: string;
} {
  if (section === "template") {
    return {
      title: "Clase 5.1 - Template reutilizable",
      description:
        "Aprendemos a usar una sola estructura para renderizar miles de paginas sin duplicar componentes.",
      points: [
        `Ruta principal del pais: ${countryPath(context.selectedCountry)}`,
        `Ruta de atributo del pais: ${context.simulatedRoute}`,
        `Ruta de categoria regional: ${context.simulatedCategoryRoute}`,
      ],
      exercise:
        "Actividad: cambia entre 3 paises y pide al grupo que identifique que parte de la ruta representa region, pais y facet.",
      code: `<CountryPageTemplate\n  params={{ region: "${slugify(context.selectedCountry.region)}", segment: "${context.selectedCountry.slug}" }}\n  country={countryData}\n/>`,
      sources: [
        "src/lib/paths.ts",
        "src/app/region/[region]/[segment]/page.tsx",
        "src/app/region/[region]/[segment]/[facet]/[valor]/page.tsx",
      ],
      checkQuestion: "Que ganamos al usar un template en lugar de crear una pagina por pais?",
      checkAnswer:
        "Escalabilidad y consistencia: la misma logica se reutiliza para cientos de URLs cambiando solo params y datos.",
    };
  }

  if (section === "metadata") {
    return {
      title: "Clase 5.2 - Metadata dinamica",
      description:
        "Cada URL arma su title, description y canonical segun el contexto de navegacion.",
      points: [
        "El title se adapta al pais y facet seleccionado.",
        "La description mantiene intencion SEO y evita textos genericos.",
        "canonical evita canibalizacion y duplicados.",
      ],
      exercise:
        "Actividad: cambia el tipo de facet y compara como cambia el title frente al caso anterior.",
      code: JSON.stringify(context.dynamicMetadata, null, 2),
      sources: [
        "src/lib/seo.ts (getCategoryIntro)",
        "src/app/modulo-5/page.tsx (generateMetadata demo)",
        "src/app/layout.tsx (metadata base del sitio)",
      ],
      checkQuestion: "Por que no conviene reutilizar el mismo title para todas las paginas?",
      checkAnswer:
        "Porque diluye relevancia semantica y baja CTR; cada URL debe reflejar su intencion exacta.",
    };
  }

  if (section === "schema") {
    return {
      title: "Clase 5.3 - Schema dinamico",
      description:
        "Usamos JSON-LD para que buscadores entiendan entidad (pais) y jerarquia (breadcrumbs).",
      points: [
        "Country schema describe la entidad principal.",
        "BreadcrumbList schema explica posicion de la pagina.",
        "El contenido se genera en servidor con datos reales.",
      ],
      exercise:
        "Actividad: identifica en el schema que propiedades cambian al cambiar de pais.",
      code: `// Country JSON-LD\n${JSON.stringify(
        context.countryJsonLd,
        null,
        2
      )}\n\n// BreadcrumbList JSON-LD\n${JSON.stringify(
        context.breadcrumbJsonLd,
        null,
        2
      )}`,
      sources: [
        "https://schema.org/Country",
        "https://schema.org/BreadcrumbList",
        "src/components/breadcrumbs.tsx",
      ],
      checkQuestion: "Que diferencia hay entre metadata y schema?",
      checkAnswer:
        "Metadata optimiza snippets visibles; schema aporta estructura semantica para rich results y contexto.",
    };
  }

  if (section === "layout") {
    return {
      title: "Clase 5.4 - Layout escalable",
      description:
        "Separamos capas globales y capas por ruta para crecer sin romper consistencia visual ni SEO.",
      points: [
        "Header/Footer viven en el layout raiz.",
        "Cada ruta cambia contenido, pero conserva la estructura base.",
        "Las convenciones de layout reducen deuda tecnica.",
      ],
      exercise:
        "Actividad: dibuja en pizarra que vive en layout global y que vive en una pagina dinamica.",
      code: `RootLayout\n├── Header global\n├── Main de cada ruta\n└── Footer global\n\nRutas del proyecto:\n/region/[region]\n/region/[region]/[segment]\n/region/[region]/[segment]/[facet]/[valor]`,
      sources: [
        "src/app/layout.tsx",
        "src/components/header.tsx",
        "src/components/footer.tsx",
      ],
      checkQuestion: "Cuando moverias algo del page.tsx al layout.tsx?",
      checkAnswer:
        "Cuando debe repetirse en muchas rutas y representa estructura global, no contenido especifico.",
    };
  }

  return {
    title: "Clase 5.5 - Componentes reutilizables",
    description:
      "Convertimos UI repetida en componentes para acelerar desarrollo y mantener coherencia.",
    points: [
      "CountryCard se reutiliza en hubs, categorias y paises relacionados.",
      "Breadcrumbs encapsula UI + JSON-LD en un solo lugar.",
      "UI base (Card, Button, Input) evita estilos duplicados.",
    ],
    exercise:
      "Actividad: elige un bloque repetido del proyecto y propongan como convertirlo en componente reusable.",
    code: `Componentes base del proyecto:\n- <CountryCard />\n- <Breadcrumbs />\n- <SearchCountries />\n- <Card />, <Button />, <Input />, <Separator />`,
    sources: [
      "src/components/country-card.tsx",
      "src/components/breadcrumbs.tsx",
      "src/components/ui/*",
    ],
    checkQuestion: "Como sabes que algo ya merece convertirse en componente?",
    checkAnswer:
      "Cuando aparece en varias vistas con la misma estructura/logica y mantenerlo duplicado aumenta riesgo de errores.",
  };
}
