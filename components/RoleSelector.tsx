"use client";

import type { RoleDefinition, RoleMode } from "@/lib/platform-content";

export function RoleSelector({
  roles,
  value,
  onChange,
}: {
  roles: RoleDefinition[];
  value: RoleMode;
  onChange: (next: RoleMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => {
        const active = role.id === value;
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={
              active
                ? "rounded-full bg-steel px-4 py-2 text-sm font-semibold text-white shadow-sm"
                : "rounded-full border border-line/70 bg-white px-4 py-2 text-sm font-semibold text-moss hover:border-steel hover:text-steel"
            }
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
