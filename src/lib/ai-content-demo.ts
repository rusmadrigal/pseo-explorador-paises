import { formatPopulation } from "@/lib/countries";

export type AiBlockType = "intro" | "travel-tip" | "comparison";

export type PromptTone = "neutral" | "editorial" | "guide";

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

export interface QaCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

const BANNED_GENERIC_PHRASES = [
  "un destino fascinante",
  "cultura rica y diversa",
  "experiencia inolvidable",
  "país lleno de contrastes",
];

const PROMPT_TEMPLATES: Record<AiBlockType, string> = {
  intro: `Escribe un párrafo introductorio de 80-120 palabras sobre {country}.
Datos verificables (NO inventes):
- Región: {region}
- Capital: {capital}
- Población: {population}
- Idiomas: {languages}
- Continente: {continent}
Tono: {tone}
Incluye un dato concreto que diferencie a {country} de otros países de {region}.`,

  "travel-tip": `Genera un consejo práctico de viaje para visitantes de {country}.
Contexto:
- Moneda local: {currency}
- Zona horaria: {timezone}
- Capital: {capital}
Máximo 60 palabras. Evita frases genéricas como "{banned}".`,

  comparison: `Compara brevemente {country} con otro país de {region} en términos de población y ubicación geográfica.
Datos de {country}: {population} habitantes, capital {capital}, subregión {subregion}.
Máximo 70 palabras. Usa cifras reales, no opines sin datos.`,
};

export function fillPromptTemplate(
  template: string,
  country: DemoCountry,
  tone: PromptTone
): string {
  const language = country.languages[0] ?? "N/A";
  const currency = country.currencies[0]?.name ?? "N/A";
  const timezone = country.timezones[0] ?? "N/A";

  return template
    .replaceAll("{country}", country.name)
    .replaceAll("{region}", country.region)
    .replaceAll("{capital}", country.capital)
    .replaceAll("{population}", formatPopulation(country.population))
    .replaceAll("{languages}", country.languages.join(", ") || "N/A")
    .replaceAll("{continent}", country.continent)
    .replaceAll("{subregion}", country.subregion || "N/A")
    .replaceAll("{currency}", currency)
    .replaceAll("{timezone}", timezone)
    .replaceAll("{tone}", tone)
    .replaceAll("{banned}", BANNED_GENERIC_PHRASES[0]);
}

export function buildScalablePrompt(
  country: DemoCountry,
  blockType: AiBlockType,
  tone: PromptTone
): string {
  return fillPromptTemplate(PROMPT_TEMPLATES[blockType], country, tone);
}

export function getTemplateOnlyIntro(country: DemoCountry): string {
  const languages =
    country.languages.length > 0 ? country.languages.join(", ") : "varios idiomas";
  return `${country.name} es un país de ${country.region}${country.subregion ? ` (${country.subregion})` : ""}, con capital en ${country.capital}, población de ${formatPopulation(country.population)} y ${languages} como idiomas principales.`;
}

/** Simulación determinista: imita salida IA sin llamar a un LLM. */
export function simulateAiOutput(
  country: DemoCountry,
  blockType: AiBlockType,
  mode: "anchored" | "generic"
): string {
  if (mode === "generic") {
    return `${country.name} es un destino fascinante con una cultura rica y diversa. Ofrece una experiencia inolvidable para todo tipo de viajeros. Es un país lleno de contrastes que merece ser explorado.`;
  }

  const seed = hashString(`${country.slug}-${blockType}`);
  const angle = ANGLES[seed % ANGLES.length];

  if (blockType === "intro") {
    return `${country.name}, en ${country.region}, destaca por ${angle}: su capital ${country.capital} concentra parte de los ${formatPopulation(country.population)} habitantes del país. El ${country.continent} aporta contexto geográfico único, mientras que el uso de ${country.languages[0] ?? "su idioma oficial"} define la comunicación local.`;
  }

  if (blockType === "travel-tip") {
    const currency = country.currencies[0];
    return `Al planificar tu visita a ${country.name}, lleva ${currency?.name ?? "moneda local"} (${currency?.symbol ?? ""}) y ten en cuenta la zona horaria ${country.timezones[0] ?? "local"}. ${country.capital} suele ser el mejor punto de partida para moverte por el país.`;
  }

  return `Con ${formatPopulation(country.population)}, ${country.name} es uno de los países más poblados de ${country.region}. Su capital, ${country.capital}, y su ubicación en ${country.subregion || country.region} lo distinguen de vecinos con perfiles demográficos distintos.`;
}

const ANGLES = [
  "su densidad poblacional",
  "su posición en el mapa regional",
  "la diversidad lingüística",
  "su capital como centro administrativo",
  "su superficie territorial",
];

export function computeDuplicationScore(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap += 1;
  }

  return Math.round((overlap / Math.max(tokensA.size, tokensB.size)) * 100);
}

export function detectGenericPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_GENERIC_PHRASES.filter((phrase) => lower.includes(phrase));
}

export function runQaChecklist(
  country: DemoCountry,
  generatedText: string,
  templateIntro: string
): QaCheckItem[] {
  const wordCount = generatedText.trim().split(/\s+/).filter(Boolean).length;
  const genericPhrases = detectGenericPhrases(generatedText);
  const mentionsCapital = generatedText
    .toLowerCase()
    .includes(country.capital.toLowerCase());
  const mentionsPopulation =
    generatedText.includes(formatPopulation(country.population)) ||
    generatedText.includes(String(country.population));
  const duplicationVsTemplate = computeDuplicationScore(
    generatedText,
    templateIntro
  );
  const hasMinimumLength = wordCount >= 35;
  const isUniqueEnough = genericPhrases.length === 0 && duplicationVsTemplate < 55;

  return [
    {
      id: "facts",
      label: "Datos verificables presentes",
      passed: mentionsCapital || mentionsPopulation,
      detail: mentionsCapital
        ? `Menciona la capital (${country.capital}).`
        : "No se detectó capital ni población en el texto.",
    },
    {
      id: "length",
      label: "Longitud mínima (≥ 35 palabras)",
      passed: hasMinimumLength,
      detail: `${wordCount} palabras generadas.`,
    },
    {
      id: "generic",
      label: "Sin frases genéricas de IA",
      passed: genericPhrases.length === 0,
      detail:
        genericPhrases.length === 0
          ? "No se detectaron muletillas típicas."
          : `Detectadas: ${genericPhrases.join(", ")}`,
    },
    {
      id: "unique",
      label: "Suficientemente único vs plantilla",
      passed: isUniqueEnough,
      detail: `${duplicationVsTemplate}% de solapamiento con intro template.`,
    },
    {
      id: "invented",
      label: "Sin datos inventados obvios",
      passed: !/\b\d{1,3}(?:\.\d{3})+\s*(?:visitantes|turistas|hoteles)\b/i.test(
        generatedText
      ),
      detail: "Revisar manualmente cifras no incluidas en el prompt.",
    },
  ];
}

export function estimateScale(blockTypes: number, countryCount: number): {
  prompts: number;
  generations: number;
  qaReviews: number;
} {
  return {
    prompts: blockTypes,
    generations: blockTypes * countryCount,
    qaReviews: Math.ceil((blockTypes * countryCount) / 10),
  };
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
  );
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
