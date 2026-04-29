import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="text-6xl mb-4">🌍</span>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. Perhaps you were looking
        for a country or region?
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Explore All Countries</Link>
      </Button>
    </main>
  );
}
