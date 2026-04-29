import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="text-6xl mb-4">🌍</span>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Página No Encontrada
      </h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        La página que buscas no existe. ¿Quizás buscabas
        un país o una región?
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Explorar Todos los Países
      </Link>
    </main>
  );
}
