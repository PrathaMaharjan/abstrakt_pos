// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    locationName: "",
    locationAddress: "",
    locationPhone: "",
  });

  function slugify(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1 — Create user
      await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // Step 2 — Create organization
      const slug = slugify(form.businessName);
      await authClient.organization.create({
        name: form.businessName,
        slug,
      });

      // Step 3 — Bootstrap tenant
      const bootstrapRes = await fetch("/api/onboarding/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.businessName, slug }),
      });

      if (!bootstrapRes.ok) {
        const data = await bootstrapRes.json();
        throw new Error(data.error ?? "Bootstrap failed");
      }

      const tenant = await bootstrapRes.json();

      // Step 4 — Create first location
      const locationRes = await fetch("/api/onboarding/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          name: form.locationName,
          address: form.locationAddress,
          phone: form.locationPhone,
        }),
      });

      if (!locationRes.ok) {
        const data = await locationRes.json();
        throw new Error(data.error ?? "Location creation failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <Section label="Your Details">
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            />
          </Section>

          <Section label="Business Details">
            <Input
              placeholder="Business name"
              value={form.businessName}
              onChange={(v) => setForm((f) => ({ ...f, businessName: v }))}
            />
          </Section>

          <Section label="First Location">
            <Input
              placeholder="Location name (e.g. Main Branch)"
              value={form.locationName}
              onChange={(v) => setForm((f) => ({ ...f, locationName: v }))}
            />
            <Input
              placeholder="Address (optional)"
              value={form.locationAddress}
              onChange={(v) => setForm((f) => ({ ...f, locationAddress: v }))}
            />
            <Input
              placeholder="Phone (optional)"
              value={form.locationPhone}
              onChange={(v) => setForm((f) => ({ ...f, locationPhone: v }))}
            />
          </Section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Setting up..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  );
}

function Input({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      required={type !== "text" || !placeholder.includes("optional")}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
    />
  );
}