"use client";

import { FormEvent, useState } from "react";
import { CONSULTING_SERVICES } from "@/lib/platform-content";

export function ConsultingForm() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="card p-8 sm:p-10" onSubmit={submit}>
      <div className="mb-8">
        <p className="eyebrow">Consulting request</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Request a second set of eyes</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Send the basic request shape now. A later pass can persist requests, attach files, and route them to an inbox.
        </p>
      </div>

      {submitted ? (
        <div className="mb-6 rounded-[20px] border border-[#bdd8c1] bg-[#f3faf4] p-4 text-sm font-semibold text-[#2f6240]">
          Request draft captured in this session. The database-backed request queue is still a follow-up.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="field-label">Name</span>
          <input className="field" name="name" required />
        </label>
        <label>
          <span className="field-label">Company</span>
          <input className="field" name="company" />
        </label>
        <label>
          <span className="field-label">Email</span>
          <input className="field" name="email" type="email" required />
        </label>
        <label>
          <span className="field-label">Phone</span>
          <input className="field" name="phone" />
        </label>
        <label>
          <span className="field-label">Role</span>
          <input className="field" name="role" placeholder="Owner, GC, estimator, PM..." />
        </label>
        <label>
          <span className="field-label">Project type</span>
          <input className="field" name="projectType" placeholder="Multifamily, TI, civil, rehab..." />
        </label>
        <label>
          <span className="field-label">Service</span>
          <select className="field" name="service">
            {CONSULTING_SERVICES.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Timeline</span>
          <input className="field" name="timeline" placeholder="This week, before signing, before bid due date..." />
        </label>
        <label className="md:col-span-2">
          <span className="field-label">What do you need help with?</span>
          <textarea className="field min-h-40" name="description" required />
        </label>
        <label>
          <span className="field-label">Budget range optional</span>
          <input className="field" name="budgetRange" />
        </label>
        <label>
          <span className="field-label">Upload documents if available</span>
          <input className="field" name="files" type="file" multiple accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg" />
        </label>
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-[22px] border border-line/60 bg-paper p-5 text-sm leading-6 text-moss">
        <input className="mt-1 h-4 w-4 accent-steel" type="checkbox" required />
        <span>I am authorized to request review or support for these project materials.</span>
      </label>

      <div className="mt-8 flex justify-end">
        <button className="button-primary" type="submit">
          Submit Request Draft
        </button>
      </div>
    </form>
  );
}
