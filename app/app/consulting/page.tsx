import { ConsultingForm } from "@/components/ConsultingForm";
import { CONSULTING_SERVICES } from "@/lib/platform-content";

export default function ConsultingPage() {
  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div>
        <p className="eyebrow">Consulting Request</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Request a JanusScope review.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Use this when the package needs a human second set of eyes on contract language, scope gaps, budget assumptions, change order support, or preconstruction handoff.
        </p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CONSULTING_SERVICES.map((service) => (
          <div className="rounded-[20px] border border-line/60 bg-white p-5 text-sm font-semibold leading-6 text-ink shadow-sm" key={service}>
            {service}
          </div>
        ))}
      </section>
      <ConsultingForm />
    </div>
  );
}
