import { demoAccessAction } from "@/app/auth/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";

export function DemoAccessForm({ returnTo }: { returnTo: string }) {
  return (
    <form action={demoAccessAction} className="card mx-auto mt-5 max-w-[520px] p-6">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Testing the product flow?</p>
          <p className="mt-1 text-sm leading-6 text-moss">
            Start a temporary demo session without creating an account.
          </p>
        </div>
        <PendingSubmitButton className="button-secondary shrink-0" pendingLabel="Starting demo...">
          Continue in Demo Mode
        </PendingSubmitButton>
      </div>
    </form>
  );
}
