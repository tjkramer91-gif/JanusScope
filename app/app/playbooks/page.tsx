import { PlaybookItemCard } from "@/components/PlaybookItemCard";

const PLAYBOOK_ITEMS = [
  {
    category: "Bid requests",
    title: "Standard bid request language",
    description: "Store the language your team prefers for trade invitations, bid due dates, alternates, and required clarifications.",
  },
  {
    category: "Buyout",
    title: "Typical buyout process",
    description: "Document the checklist your team uses before subcontracts are released and long lead items are approved.",
  },
  {
    category: "RFIs",
    title: "Standard RFI format",
    description: "Preserve how your team frames background, references, impact language, and requested answers.",
  },
  {
    category: "Change orders",
    title: "Standard change order format",
    description: "Capture the narrative structure, backup expectations, and approval steps used internally.",
  },
  {
    category: "Trade notes",
    title: "Trade-specific lessons learned",
    description: "Keep recurring misses, exclusions to watch, and bid-form expectations organized by trade.",
  },
  {
    category: "Clients",
    title: "Owner-specific requirements",
    description: "Track recurring owner standards, closeout expectations, and communication preferences.",
  },
];

export default function PlaybooksPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Company Playbooks</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Store the habits your team does not want to lose</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Playbooks let teams preserve preferred review habits, language, and lessons so newer staff can work from a better starting point.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {PLAYBOOK_ITEMS.map((item) => (
          <PlaybookItemCard category={item.category} title={item.title} description={item.description} key={item.title} />
        ))}
      </div>
    </div>
  );
}
