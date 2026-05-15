import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { RouteNames } from "@/constants";

export default function MarketingHomePage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-4 py-16 sm:py-24">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:gap-8">
        <Image src="/icon0.svg" alt="AAA Portfolio" width={100} height={100} className="w-25 h-25 object-contain mb-4" />
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          AAA Portfolio
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Project overview, lifecycle phases, and deep links to the client
          dashboard. Sign in to open the app.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="min-w-[10rem] rounded-lg">
            <Link href={RouteNames.Login}>Sign in</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
