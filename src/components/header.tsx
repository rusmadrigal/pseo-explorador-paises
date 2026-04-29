import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg">
          <span className="text-xl">🌍</span>
          <span>WorldExplorer</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Countries
          </Link>
          <Link href="/region/africa" className="transition-colors hover:text-foreground">
            Regions
          </Link>
        </nav>
      </div>
    </header>
  );
}
