import { MetadataRoute } from "next";
import {
  CountryGroupType,
  getAllCountries,
  getGroupValues,
  getRegions,
  slugify,
} from "@/lib/countries";

const GROUP_TYPES: CountryGroupType[] = [
  "idioma",
  "moneda",
  "subregion",
  "continente",
  "zona-horaria",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://world-explorer.vercel.app";

  const countries = await getAllCountries();
  const regions = await getRegions();

  const home: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${baseUrl}/region/${slugify(r)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${baseUrl}/country/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryTypeHubs: MetadataRoute.Sitemap = GROUP_TYPES.map((tipo) => ({
    url: `${baseUrl}/paises/${tipo}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = (
    await Promise.all(
      GROUP_TYPES.map(async (tipo) => {
        const values = await getGroupValues(tipo);
        return values.map((value) => ({
          url: `${baseUrl}/paises/${tipo}/${slugify(value)}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.65,
        }));
      })
    )
  ).flat();

  const landingPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/paises/sudamerica`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];

  return [
    ...home,
    ...regionPages,
    ...categoryTypeHubs,
    ...landingPages,
    ...categoryPages,
    ...countryPages,
  ];
}
