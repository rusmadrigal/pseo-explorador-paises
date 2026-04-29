import { MetadataRoute } from "next";
import { getAllCountries, getRegions, slugify } from "@/lib/countries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://world-explorer.vercel.app";

  const countries = await getAllCountries();
  const regions = await getRegions();

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${baseUrl}/country/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${baseUrl}/region/${slugify(r)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...regionPages,
    ...countryPages,
  ];
}
