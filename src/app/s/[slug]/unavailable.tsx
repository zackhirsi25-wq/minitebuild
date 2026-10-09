export function Unavailable({ name }: { name: string }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-6 font-sans text-slate-900">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          This website is temporarily unavailable. Please check back soon.
        </p>
      </div>
    </main>
  );
}
