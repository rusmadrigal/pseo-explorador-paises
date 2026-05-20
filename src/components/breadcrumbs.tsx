import Link from "next/link";
import { BreadcrumbItem, buildBreadcrumbJsonLd } from "@/lib/seo";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = buildBreadcrumbJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground" : undefined}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
