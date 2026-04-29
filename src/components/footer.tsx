import Link from "next/link";

const regions = [
  { name: "Africa", slug: "africa" },
  { name: "Americas", slug: "americas" },
  { name: "Asia", slug: "asia" },
  { name: "Europe", slug: "europe" },
  { name: "Oceania", slug: "oceania" },
  { name: "Antarctic", slug: "antarctic" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="mb-3 font-heading font-semibold text-sm">
              🌍 WorldExplorer
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore every country in the world. Population, languages,
              currencies, and more — all in one place.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-heading font-semibold text-sm">
              Regions
            </h3>
            <ul className="space-y-1.5">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/region/${r.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-heading font-semibold text-sm">
              About this project
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Programmatic SEO demo project built with Next.js. Data from
              the{" "}
              <a
                href="https://restcountries.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                REST Countries API
              </a>
              .
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          Built as a Programmatic SEO example &middot; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
