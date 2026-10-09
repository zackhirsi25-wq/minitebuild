import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brandFont } from "@/components/brand-font";
import { product } from "@/config/product";
import { getAdminUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: `Sign in | ${product.name}`, robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getAdminUser()) redirect("/admin");
  const { error } = await searchParams;
  const initialError = error === "not-allowed" ? "This account doesn't have access to the admin panel." : null;

  return (
    <main className={`${brandFont.className} grid min-h-dvh place-items-center bg-slate-50 px-4 py-10`}>
      <div className="w-full max-w-sm">
        <p className="text-center text-2xl font-bold tracking-tight text-slate-900">{product.name}</p>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h1 className="text-lg font-semibold text-slate-900">Sign in to the admin panel</h1>
          <div className="mt-6">
            <LoginForm initialError={initialError} />
          </div>
        </div>
      </div>
    </main>
  );
}
