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
import {
  buildScalablePrompt,
  computeDuplicationScore,
  estimateScale,
  getTemplateOnlyIntro,
  runQaChecklist,
  simulateAiOutput,
  type AiBlockType,
  type DemoCountry,
  type PromptTone,
} from "@/lib/ai-content-demo";

type DemoSection = "ia-pseo" | "prompts" | "duplicacion" | "qa";

const SECTION_LABELS: Record<DemoSection, string> = {
  "ia-pseo": "1) IA para pSEO",
  prompts: "2) Prompts escalables",
  duplicacion: "3) Evitar duplicación",
  qa: "4) QA manual",
};

const BLOCK_TYPES: { id: AiBlockType; label: string }[] = [
  { id: "intro", label: "Intro" },
  { id: "travel-tip", label: "Consejo viaje" },
  { id: "comparison", label: "Comparativa" },
];

const TONES: { id: PromptTone; label: string }[] = [
  { id: "neutral", label: "Neutral" },
  { id: "editorial", label: "Editorial" },
  { id: "guide", label: "Guía práctica" },
];

export function Module7Playground({ countries }: { countries: DemoCountry[] }) {
  const [activeSection, setActiveSection] = useState<DemoSection>("ia-pseo");
  const [query, setQuery] = useState("");
  const [blockType, setBlockType] = useState<AiBlockType>("intro");
  const [tone, setTone] = useState<PromptTone>("neutral");
  const [outputMode, setOutputMode] = useState<"anchored" | "generic">("anchored");
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
    countries.find((country) => country.slug === "spain") ??
    countries.find((country) => country.slug === "mexico") ??
    countries[0];

  const selectedCountry = query.trim()
    ? (filtered[0] ?? defaultCountry)
    : defaultCountry;

  const compareCountry =
    countries.find(
      (country) =>
        country.region === selectedCountry.region &&
        country.slug !== selectedCountry.slug
    ) ?? countries[1] ?? selectedCountry;

  const templateIntro = getTemplateOnlyIntro(selectedCountry);
  const filledPrompt = buildScalablePrompt(selectedCountry, blockType, tone);
  const aiOutput = simulateAiOutput(selectedCountry, blockType, outputMode);
  const genericOutput = simulateAiOutput(selectedCountry, blockType, "generic");
  const anchoredOutput = simulateAiOutput(selectedCountry, blockType, "anchored");
  const compareGenericOutput = simulateAiOutput(compareCountry, blockType, "generic");
  const qaResults = runQaChecklist(selectedCountry, aiOutput, templateIntro);
  const qaPassed = qaResults.filter((item) => item.passed).length;
  const duplicationGeneric = computeDuplicationScore(genericOutput, compareGenericOutput);
  const duplicationAnchored = computeDuplicationScore(anchoredOutput, templateIntro);
  const scale = estimateScale(BLOCK_TYPES.length, countries.length);

  const lesson = getLessonData(activeSection, {
    selectedCountry,
    compareCountry,
    blockType,
    tone,
    templateIntro,
    filledPrompt,
    aiOutput,
    genericOutput,
    anchoredOutput,
    qaResults,
    qaPassed,
    duplicationGeneric,
    duplicationAnchored,
    scale,
    outputMode,
  });

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Nota para la clase:</strong> «Content
          blocks dinámicos» ya se vio en el{" "}
          <a href="/modulo-6" className="underline underline-offset-2">
            Módulo 6
          </a>
          . Aquí nos centramos en la capa de IA: cómo generar texto, escalar
          prompts y validarlo antes de publicarlo en esos bloques.
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Laboratorio de clase</CardTitle>
          <CardDescription>
            Elige un país, tipo de bloque y tono. Observa el prompt generado, la
            salida simulada de IA y el checklist de QA en tiempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            placeholder="Ej: españa, méxico, japón..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={blockType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setBlockType(type.id)}
              >
                {type.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TONES.map((item) => (
              <Button
                key={item.id}
                variant={tone === item.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTone(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">País: {selectedCountry.name}</Badge>
            <Badge variant="outline">Bloque: {blockType}</Badge>
            <Badge variant="outline">Tono: {tone}</Badge>
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
            filledPrompt={filledPrompt}
            templateIntro={templateIntro}
            aiOutput={aiOutput}
            genericOutput={genericOutput}
            anchoredOutput={anchoredOutput}
            compareGenericOutput={compareGenericOutput}
            duplicationGeneric={duplicationGeneric}
            duplicationAnchored={duplicationAnchored}
            qaResults={qaResults}
            qaPassed={qaPassed}
            scale={scale}
            outputMode={outputMode}
            onOutputModeChange={setOutputMode}
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
  filledPrompt,
  templateIntro,
  aiOutput,
  genericOutput,
  anchoredOutput,
  compareGenericOutput,
  duplicationGeneric,
  duplicationAnchored,
  qaResults,
  qaPassed,
  scale,
  outputMode,
  onOutputModeChange,
}: {
  activeSection: DemoSection;
  filledPrompt: string;
  templateIntro: string;
  aiOutput: string;
  genericOutput: string;
  anchoredOutput: string;
  compareGenericOutput: string;
  duplicationGeneric: number;
  duplicationAnchored: number;
  qaResults: ReturnType<typeof runQaChecklist>;
  qaPassed: number;
  scale: ReturnType<typeof estimateScale>;
  outputMode: "anchored" | "generic";
  onOutputModeChange: (mode: "anchored" | "generic") => void;
}) {
  if (activeSection === "ia-pseo") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline IA → bloques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { step: "1. Datos", value: "API / getAllCountries()" },
            { step: "2. Prompt", value: `${filledPrompt.slice(0, 60)}…` },
            { step: "3. IA", value: aiOutput.slice(0, 90) + "…" },
            { step: "4. QA", value: `${qaPassed}/${qaResults.length} checks OK` },
            { step: "5. Bloque", value: "Se inserta en country-detail (Mód. 6)" },
          ].map((item) => (
            <div key={item.step} className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {item.step}
              </p>
              <p className="mt-1">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "prompts") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompt escalable</CardTitle>
          <CardDescription>
            {scale.prompts} plantillas × {scale.generations / scale.prompts} países
            = {scale.generations} generaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed whitespace-pre-wrap">
            {filledPrompt}
          </pre>
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "duplicacion") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparador de duplicación</CardTitle>
          <CardDescription>
            Mismo prompt genérico en dos países distintos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-semibold text-destructive">Salida genérica</p>
            <p className="mt-1 text-muted-foreground">{genericOutput}</p>
            <Badge variant="destructive" className="mt-2">
              {duplicationGeneric}% similar entre países
            </Badge>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-semibold text-primary">Salida anclada a datos</p>
            <p className="mt-1 text-muted-foreground">{anchoredOutput}</p>
            <Badge variant="outline" className="mt-2">
              {duplicationAnchored}% solapamiento con template
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Otro país (mismo prompt genérico): «{compareGenericOutput.slice(0, 70)}…»
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist QA manual</CardTitle>
        <CardDescription>
          {qaPassed}/{qaResults.length} aprobados · modo{" "}
          {outputMode === "anchored" ? "anclado" : "genérico"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={outputMode === "anchored" ? "default" : "outline"}
            onClick={() => onOutputModeChange("anchored")}
          >
            Probar anclado
          </Button>
          <Button
            size="sm"
            variant={outputMode === "generic" ? "destructive" : "outline"}
            onClick={() => onOutputModeChange("generic")}
          >
            Probar genérico
          </Button>
        </div>
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          {aiOutput}
        </p>
        {qaResults.map((item) => (
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
        <p className="text-xs text-muted-foreground">
          Referencia template (sin IA): {templateIntro}
        </p>
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

function getLessonData(
  section: DemoSection,
  ctx: {
    selectedCountry: DemoCountry;
    compareCountry: DemoCountry;
    blockType: AiBlockType;
    tone: PromptTone;
    templateIntro: string;
    filledPrompt: string;
    aiOutput: string;
    genericOutput: string;
    anchoredOutput: string;
    qaResults: ReturnType<typeof runQaChecklist>;
    qaPassed: number;
    duplicationGeneric: number;
    duplicationAnchored: number;
    scale: ReturnType<typeof estimateScale>;
    outputMode: "anchored" | "generic";
  }
) {
  const country = ctx.selectedCountry;

  if (section === "ia-pseo") {
    return {
      title: "Clase 7.1 — IA para pSEO",
      description:
        "La IA complementa (no reemplaza) las plantillas del Módulo 6: genera texto enriquecido que luego se inserta en bloques existentes.",
      points: [
        "Plantilla actual del proyecto: getCountryIntro() — determinista, sin IA.",
        "Capa IA opcional: prompts + generación + QA antes de publicar.",
        "Regla de oro: datos estructurados (API) + narrativa (IA) + validación humana.",
        "No uses IA para todo: stats, enlaces y schema siguen siendo código.",
      ],
      exercise:
        "Actividad: identifica qué partes de country-detail.tsx pueden ser IA y cuáles deben seguir siendo datos/API.",
      code: `// Pipeline híbrido pSEO\nconst data = await getCountryBySlug(slug);     // API\nconst intro = getCountryIntro(data);            // Template (Mód. 6)\nconst prompt = buildScalablePrompt(data, "intro", "neutral");\nconst aiText = await generateWithLLM(prompt);   // IA (Mód. 7)\nconst qa = runQaChecklist(data, aiText, intro); // QA manual\nif (qa.every(c => c.passed)) publish(aiText);`,
      sources: [
        "src/lib/ai-content-demo.ts",
        "src/lib/seo.ts (getCountryIntro)",
        "src/components/country-detail.tsx",
      ],
      checkQuestion: "¿Cuándo tiene sentido usar IA en un proyecto pSEO?",
      checkAnswer:
        "Cuando necesitas narrativa única a escala (intros, guías, comparativas) que las plantillas solas no cubren, siempre anclada a datos verificables.",
    };
  }

  if (section === "prompts") {
    return {
      title: "Clase 7.2 — Prompts escalables",
      description:
        "Un prompt bien diseñado se reutiliza para cientos de URLs cambiando solo variables del dataset.",
      points: [
        `${ctx.scale.prompts} tipos de bloque × ${ctx.scale.generations / ctx.scale.prompts} países = ${ctx.scale.generations} generaciones potenciales.`,
        "Variables clave: país, región, capital, población, idiomas, moneda.",
        "Instrucciones fijas: longitud, tono, prohibición de inventar datos.",
        "Un prompt = una responsabilidad (intro, consejo, comparativa).",
      ],
      exercise:
        "Actividad: cambia el tipo de bloque y el tono. Observa qué variables se mantienen y cuáles cambia el prompt.",
      code: ctx.filledPrompt,
      sources: [
        "src/lib/ai-content-demo.ts (buildScalablePrompt)",
        "src/lib/seo.ts (patrón similar con getCategoryIntro)",
      ],
      checkQuestion: "¿Qué hace escalable un prompt?",
      checkAnswer:
        "Separar instrucciones fijas de variables dinámicas ({country}, {population}…) y definir restricciones claras para que cada salida sea única pero consistente.",
    };
  }

  if (section === "duplicacion") {
    return {
      title: "Clase 7.3 — Evitar duplicación",
      description:
        "El Módulo 6 habló de thin content; aquí el riesgo es distinto: la IA produce textos casi idénticos entre URLs si el prompt es vago.",
      points: [
        `Salida genérica: ${ctx.duplicationGeneric}% de similitud entre ${country.name} y ${ctx.compareCountry.name}.`,
        `Salida anclada: ${ctx.duplicationAnchored}% de solapamiento con la plantilla.`,
        "Técnicas: anclar datos en el prompt, exigir ángulo único, prohibir muletillas.",
        "Medir similitud entre outputs antes de publicar (no solo contra Google).",
      ],
      exercise:
        "Actividad: compara las dos salidas del panel derecho y lista 3 frases que se repiten en la versión genérica.",
      code: `// ❌ Prompt vago → duplicación\n"Escribe sobre {country}"\n→ "${ctx.genericOutput}"\n\n// ✅ Prompt anclado → único\n"Incluye capital, población e idioma de {country}"\n→ "${ctx.anchoredOutput}"`,
      sources: [
        "src/lib/ai-content-demo.ts (computeDuplicationScore)",
        "src/lib/ai-content-demo.ts (detectGenericPhrases)",
      ],
      checkQuestion:
        "¿En qué se diferencia evitar duplicación IA del thin content del Módulo 6?",
      checkAnswer:
        "Thin content es poco valor por página; duplicación IA es texto distinto en apariencia pero semánticamente casi igual entre URLs, típico cuando el prompt no fuerza datos únicos.",
    };
  }

  return {
    title: "Clase 7.4 — QA manual",
    description:
      "Ninguna salida de IA se publica sin revisión. El checklist automatizado filtra; el humano valida hechos y tono.",
    points: [
      `${ctx.qaPassed}/${ctx.qaResults.length} checks automáticos pasados (modo ${ctx.outputMode}).`,
      "QA automatizado: longitud, frases genéricas, solapamiento, datos mencionados.",
      "QA humano: verificar cifras, enlaces, tono de marca, no alucinaciones.",
      `Muestra de ${ctx.scale.qaReviews} revisiones manuales por lote de ${ctx.scale.generations} generaciones.`,
    ],
    exercise:
      "Actividad: pulsa «Probar genérico» y revisa qué checks fallan. Luego corrige mentalmente el texto antes de publicar.",
    code: `const qa = runQaChecklist(country, aiText, templateIntro);\n\n${ctx.qaResults
      .map((item) => `// ${item.passed ? "✓" : "✗"} ${item.label}: ${item.detail}`)
      .join("\n")}`,
    sources: [
      "src/lib/ai-content-demo.ts (runQaChecklist)",
      "src/components/country-detail.tsx (destino final del contenido)",
    ],
    checkQuestion: "¿Por qué el QA manual sigue siendo necesario con buenos prompts?",
    checkAnswer:
      "Porque la IA puede inventar datos plausibles, usar tono incorrecto o pasar checks automáticos con errores sutiles que solo un revisor detecta.",
  };
}
