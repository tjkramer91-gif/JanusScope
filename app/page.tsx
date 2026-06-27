import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    absolute: "Website Under Construction | Janus Construction Advisory, LLC",
  },
  description:
    "Janus Construction Advisory, LLC is building a practical construction advisory platform focused on scope, cost clarity, project risk, and better decisions.",
};

export default function LandingPage() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden bg-[#080a0c] text-white">
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover object-[84%_center] sm:object-center"
        fill
        priority
        sizes="100vw"
        src="/images/janus-construction-advisory-hero-v6.png"
      />

      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/80 via-black/35 to-transparent sm:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent sm:hidden" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1280px] flex-col justify-end px-6 pb-10 pt-24 sm:justify-center sm:px-10 sm:py-16 lg:px-16">
        <section className="max-w-2xl" aria-labelledby="under-construction-title">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase text-white/75 sm:text-sm">
            <span className="h-px w-10 bg-white/50" aria-hidden="true" />
            Janus Construction Advisory, LLC
          </p>

          <h1
            className="mt-5 max-w-xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl"
            id="under-construction-title"
          >
            Website Under Construction
          </h1>

          <p className="mt-6 text-lg font-semibold leading-7 text-white sm:text-xl sm:leading-8">
            Janus Construction Advisory, LLC is currently being built.
          </p>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            We are developing a practical construction advisory platform focused on scope review, bid leveling,
            project risk, cost clarity, and better decision-making before construction problems become expensive.
          </p>
        </section>

      </div>
    </main>
  );
}
