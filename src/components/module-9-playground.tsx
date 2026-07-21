"use client";

import Link from "next/link";
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
  avgFacetsPerCountry,
  type DemoCountry,
} from "@/lib/technical-seo-demo";
import {
  buildCapstoneTasks,
  buildDeploySteps,
  buildGoLiveChecklist,
  buildPipelineRecap,
  buildSearchConsoleSnapshot,
  estimateSitemapUrlCount,
  type CapstoneTask,
} from "@/lib/launch-seo-demo";

type DemoSection = "go-live" | "medicion" | "cierre";

const SECTION_LABELS: Record<DemoSection, string> = {
  "go-live": "1) Go-live",
  medicion: "2) Medición",
  cierre: "3) Cierre del curso",
};

export function Module9Playground({
  countries,
  totalCountryCount,
  regionCount,
}: {
  countries: DemoCountry[];
  totalCountryCount: number;
  regionCount: number;
}) {
  const [activeSection, setActiveSection] = useState<DemoSection>("go-live");
  const [query, setQuery] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [capstoneTasks, setCapstoneTasks] = useState(buildCapstoneTasks);

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

  const sitemapUrlCount = estimateSitemapUrlCount(
    totalCountryCount,
    regionCount,
    avgFacetsPerCountry(countries)
  );
  const goLiveChecklist = buildGoLiveChecklist(totalCountryCount, sitemapUrlCount);
  const goLivePassed = goLiveChecklist.filter((item) => item.passed).length;
  const deploySteps = buildDeploySteps();
  const gscSnapshot = buildSearchConsoleSnapshot(
    selectedCountry,
    totalCountryCount,
    regionCount,
    sitemapUrlCount
  );
  const pipeline = buildPipelineRecap();
  const capstoneDone = capstoneTasks.filter((task) => task.done).length;

  const lesson = getLessonData(activeSection, {
    selectedCountry,
    totalCountryCount,
    sitemapUrlCount,
    goLiveChecklist,
    goLivePassed,
    deploySteps,
    gscSnapshot,
    pipeline,
    capstoneTasks,
    capstoneDone,
  });

  function toggleCapstoneTask(id: string) {
    setCapstoneTasks((tasks) =>
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Módulo final del curso.</strong>{" "}
          Ya construiste el motor pSEO en los módulos 5–8. Aquí lo publicas,
          mides resultados en Search Console y cierras con un proyecto propio.
          Es la última pieza:{" "}
          <strong className="text-foreground">de build a tráfico real</strong>.
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Laboratorio de clase</CardTitle>
          <CardDescription>
            Simula el go-live de ExploradorMundial ({totalCountryCount} países,{" "}
            {sitemapUrlCount} URLs en sitemap) y revisa qué KPIs mirar después
            del deploy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            placeholder="Ej: méxico, brasil, españa..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Caso: {selectedCountry.name}</Badge>
            <Badge variant="outline">
              Checklist: {goLivePassed}/{goLiveChecklist.length}
            </Badge>
            <Badge variant="outline">
              Capstone: {capstoneDone}/{capstoneTasks.length}
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
            goLiveChecklist={goLiveChecklist}
            goLivePassed={goLivePassed}
            deploySteps={deploySteps}
            gscSnapshot={gscSnapshot}
            pipeline={pipeline}
            capstoneTasks={capstoneTasks}
            capstoneDone={capstoneDone}
            onToggleCapstone={toggleCapstoneTask}
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
  goLiveChecklist,
  goLivePassed,
  deploySteps,
  gscSnapshot,
  pipeline,
  capstoneTasks,
  capstoneDone,
  onToggleCapstone,
}: {
  activeSection: DemoSection;
  goLiveChecklist: ReturnType<typeof buildGoLiveChecklist>;
  goLivePassed: number;
  deploySteps: ReturnType<typeof buildDeploySteps>;
  gscSnapshot: ReturnType<typeof buildSearchConsoleSnapshot>;
  pipeline: ReturnType<typeof buildPipelineRecap>;
  capstoneTasks: CapstoneTask[];
  capstoneDone: number;
  onToggleCapstone: (id: string) => void;
}) {
  if (activeSection === "go-live") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checklist go-live</CardTitle>
          <CardDescription>
            {goLivePassed}/{goLiveChecklist.length} listos para producción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {goLiveChecklist.map((item) => (
            <div
              key={item.id}
              className={`rounded-md border p-3 text-sm ${
                item.passed
                  ? "border-primary/30 bg-primary/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <p className="font-medium">
                {item.passed ? "✓" : "○"} {item.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              {item.file && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {item.file}
                </p>
              )}
            </div>
          ))}
          <Separator />
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Pasos de deploy
          </p>
          {deploySteps.map((step) => (
            <div key={step.order} className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {step.order}. {step.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
              {step.command && (
                <p className="mt-1 font-mono text-xs">{step.command}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeSection === "medicion") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Console (simulado)</CardTitle>
          <CardDescription>{gscSnapshot.siteUrl}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Indexadas (est.)", value: gscSnapshot.totalIndexed },
              { label: "Impresiones", value: gscSnapshot.totalImpressions },
              { label: "Clics", value: gscSnapshot.totalClicks },
              {
                label: "CTR medio",
                value: `${gscSnapshot.avgCtr.toFixed(1)}%`,
              },
            ].map((metric) => (
              <div key={metric.label} className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-1 font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
          {gscSnapshot.templates.map((row) => (
            <div key={row.template} className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{row.template}</p>
                <Badge variant="outline">{row.ctr.toFixed(1)}% CTR</Badge>
              </div>
              <p className="mt-1 font-mono text-xs">{row.exampleUrl}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.impressions} imp · {row.clicks} clics · pos.{" "}
                {row.avgPosition.toFixed(0)}
              </p>
            </div>
          ))}
          <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
            {gscSnapshot.insight}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline completo + capstone</CardTitle>
        <CardDescription>
          {capstoneDone}/{capstoneTasks.length} tareas del proyecto final
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {pipeline.map((step) => (
          <div key={step.module} className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {step.module}
              </p>
              {step.href && (
                <Link
                  href={step.href}
                  className="text-xs underline underline-offset-2"
                >
                  Ver módulo
                </Link>
              )}
            </div>
            <p className="mt-1 font-medium">{step.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{step.output}</p>
          </div>
        ))}
        <Separator />
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Proyecto final
        </p>
        {capstoneTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onToggleCapstone(task.id)}
            className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
              task.done
                ? "border-primary/30 bg-primary/5"
                : "border-dashed hover:bg-muted/50"
            }`}
          >
            <p className="font-medium">
              {task.done ? "✓" : "○"} {task.task}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Entregable: {task.deliverable}
            </p>
          </button>
        ))}
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
    totalCountryCount: number;
    sitemapUrlCount: number;
    goLiveChecklist: ReturnType<typeof buildGoLiveChecklist>;
    goLivePassed: number;
    deploySteps: ReturnType<typeof buildDeploySteps>;
    gscSnapshot: ReturnType<typeof buildSearchConsoleSnapshot>;
    pipeline: ReturnType<typeof buildPipelineRecap>;
    capstoneTasks: CapstoneTask[];
    capstoneDone: number;
  }
) {
  const country = ctx.selectedCountry;

  if (section === "go-live") {
    const pending = ctx.goLiveChecklist.filter((item) => !item.passed);
    return {
      title: "Clase 9.1 — Go-live",
      description:
        "Publicar en producción no es el final: es el inicio del ciclo de indexación. Checklist mínimo antes de enviar el sitemap a Search Console.",
      points: [
        `${ctx.goLivePassed}/${ctx.goLiveChecklist.length} checks automáticos del proyecto listos.`,
        `${ctx.sitemapUrlCount} URLs en sitemap.xml generado en build.`,
        "Define NEXT_PUBLIC_SITE_URL antes del deploy para canonicals correctos.",
        pending.length > 0
          ? `Pendiente manual: ${pending.map((item) => item.label).join(", ")}.`
          : "Checklist técnico completo; solo falta Search Console post-deploy.",
      ],
      exercise:
        "Actividad: recorre el checklist del panel y anota qué archivo del repo resuelve cada ítem.",
      code: ctx.deploySteps
        .map(
          (step) =>
            `${step.order}. ${step.title}${step.command ? `\n   ${step.command}` : ""}\n   ${step.detail}`
        )
        .join("\n\n"),
      sources: [
        "src/app/sitemap.ts",
        "src/app/robots.ts",
        "src/app/not-found.tsx",
        "vercel.json / Vercel dashboard",
      ],
      checkQuestion: "¿Por qué configurar NEXT_PUBLIC_SITE_URL antes del deploy?",
      checkAnswer:
        "Porque canonicals, Open Graph y sitemap usan esa base URL. Si cambia después, Google puede ver señales inconsistentes entre entornos.",
    };
  }

  if (section === "medicion") {
    const top = [...ctx.gscSnapshot.templates].sort((a, b) => b.ctr - a.ctr)[0];
    return {
      title: "Clase 9.2 — Medición",
      description:
        "En pSEO no basta con «está online». Mide por plantilla: país, hub, categoría y facet. Así sabes qué escalar y qué podar.",
      points: [
        `Simulación para ${country.name}: ${ctx.gscSnapshot.totalImpressions} impresiones, ${ctx.gscSnapshot.totalClicks} clics.`,
        `Mejor plantilla simulada: ${top.template} (${top.ctr.toFixed(1)}% CTR).`,
        "Search Console → Rendimiento: filtra por URL contiene /region/ o slug de país.",
        "Compara indexadas vs enviadas en Informes → Páginas → Sitemap.",
        ctx.gscSnapshot.insight,
      ],
      exercise:
        "Actividad: identifica en el panel qué plantilla tiene mejor CTR y propón 1 mejora de enlazado interno.",
      code: `// KPIs por plantilla (Search Console)\n${ctx.gscSnapshot.templates
        .map(
          (row) =>
            `${row.template}\n  URL: ${row.exampleUrl}\n  CTR: ${row.ctr.toFixed(1)}% · Pos: ${row.avgPosition.toFixed(0)}`
        )
        .join("\n\n")}`,
      sources: [
        "Google Search Console (Rendimiento, Cobertura, Sitemaps)",
        "src/lib/paths.ts (patrones de URL por plantilla)",
        "src/app/sitemap.ts",
      ],
      checkQuestion: "¿Qué KPI mirarías primero en un sitio pSEO nuevo?",
      checkAnswer:
        "Páginas indexadas vs URLs enviadas en el sitemap. Sin indexación no hay impresiones ni clics; el resto de KPIs viene después.",
    };
  }

  return {
    title: "Clase 9.3 — Cierre del curso",
    description:
      "Recapitulación del pipeline completo y proyecto final: replica el sistema en tu nicho con 10–20 URLs, deploy y medición a 14 días.",
    points: [
      `${ctx.pipeline.length} etapas del curso: de fundamentos a tráfico real.`,
      "Pipeline: datos → plantillas → contenido/IA → technical SEO → deploy → medición.",
      `${ctx.capstoneDone}/${ctx.capstoneTasks.length} tareas del capstone completadas en el panel.`,
      "Próximo paso: tu dataset, tu keyword research, tu plantilla, tu Search Console.",
    ],
    exercise:
      "Actividad: marca las 6 tareas del capstone y define tu nicho + 3 URLs objetivo para la semana 1.",
    code: ctx.capstoneTasks
      .map((task) => `[ ] ${task.task}\n    → ${task.deliverable}`)
      .join("\n\n"),
    sources: [
      "resources/pSEO KW Reserach.xlsx",
      "src/app/modulo-5/page.tsx … modulo-8/page.tsx",
      "README.md (estructura del proyecto)",
    ],
    checkQuestion: "¿Qué demuestra que dominas pSEO al terminar el curso?",
    checkAnswer:
      "No solo generar páginas, sino publicar un sistema medible: dataset + plantilla + technical SEO + Search Console con decisiones basadas en datos reales.",
  };
}
