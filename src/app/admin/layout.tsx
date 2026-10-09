import type { Metadata } from "next";
import { BottomNav, SidebarNav } from "@/components/admin/nav";
import { brandFont } from "@/components/brand-font";
import { ToastProvider } from "@/components/ui/toast";
import { product } from "@/config/product";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../login/actions";

export const metadata: Metadata = {
  title: { default: `Admin | ${product.name}`, template: `%s | ${product.name} admin` },
  robots: { index: false, follow: false },
};

// Generating a site (single entry) and import chunks can take a while.
export const maxDuration = 300;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <ToastProvider>
      <div className={`${brandFont.className} min-h-dvh bg-slate-50 text-slate-900`}>
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
          <p className="px-3 text-lg font-bold tracking-tight">{product.name}</p>
          <div className="mt-8 flex-1">
            <SidebarNav />
          </div>
          <div className="border-t border-slate-200 px-3 pt-4">
            <p className="truncate text-sm text-slate-500" title={user.email}>
              {user.email}
            </p>
            <form action={signOut}>
              <button type="submit" className="mt-1 min-h-11 text-sm font-medium text-slate-700 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <div className="pb-24 md:pb-0 md:pl-60">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <p className="font-bold tracking-tight">{product.name}</p>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
