import { MetadataRoute } from "next";
import {
  getAllCountries,
  getCountryFacets,
  getGroupValuesInRegion,
  getRegions,
  slugify,
} from "@/lib/countries";
import {
  GROUP_TYPES,
  countryFacetPath,
  countryPath,
  regionCategoryHubPath,
  regionCategoryPath,
  regionPath,
  southAmericaLandingPath,
} from "@/lib/paths";

function entry(
  baseUrl: string,
  pathname: string,
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${pathname}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://world-explorer.vercel.app";

  const countries = await getAllCountries();
  const regions = await getRegions();

  const urls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...regions.map((r) => entry(baseUrl, regionPath(r), 0.7)),
    entry(baseUrl, southAmericaLandingPath(), 0.75),
    ...countries.map((c) => entry(baseUrl, countryPath(c), 0.8)),
    ...countries.flatMap((c) =>
      getCountryFacets(c).map((facet) =>
        entry(baseUrl, countryFacetPath(c, facet.tipo, facet.value), 0.75)
      )
    ),
    ...regions.flatMap((regionName) =>
      GROUP_TYPES.map((tipo) =>
        entry(baseUrl, regionCategoryHubPath(regionName, tipo), 0.6)
      )
    ),
    ...(
      await Promise.all(
        regions.map(async (regionName) => {
          const regionSlug = slugify(regionName);
          const byType = await Promise.all(
            GROUP_TYPES.map(async (tipo) => {
              const values = await getGroupValuesInRegion(regionSlug, tipo);
              return values.map((value) =>
                entry(baseUrl, regionCategoryPath(regionName, tipo, value), 0.65)
              );
            })
          );
          return byType.flat();
        })
      )
    ).flat(),
  ];

  const seen = new Set<string>();
  return urls.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
