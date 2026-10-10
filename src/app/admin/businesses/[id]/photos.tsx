"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import type { ImageSlot } from "@/lib/content/schema";
import type { SiteImage } from "@/lib/images/stock";
import { resetPhoto, uploadPhoto } from "../../actions";

const SLOT_LABELS: Record<ImageSlot, string> = {
  hero: "Hero photo",
  about: "About photo",
  feature: "Closing photo",
  detail: "Close-up photo",
  "gallery-1": "Work photo 1",
  "gallery-2": "Work photo 2",
  "gallery-3": "Work photo 3",
  "gallery-4": "Work photo 4",
  "gallery-5": "Work photo 5",
  "gallery-6": "Work photo 6",
};

export function Photos({
  id,
  name,
  city,
  slots,
}: {
  id: string;
  name: string;
  city: string;
  slots: { slot: ImageSlot; image: SiteImage | null; uploaded: boolean }[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Photos</h2>
      <p className="mt-1 text-sm text-slate-600">
        Replace a stock photo with the business&apos;s own. JPEG, PNG or WebP, up to 5 MB.
      </p>
      <div className="mt-4 space-y-5">
        {slots.map((s) => (
          <PhotoSlot key={s.slot} id={id} defaultAlt={`Recent project by ${name} in ${city}`} {...s} />
        ))}
      </div>
    </section>
  );
}

function PhotoSlot({
  id,
  slot,
  image,
  uploaded,
  defaultAlt,
}: {
  id: string;
  slot: ImageSlot;
  image: SiteImage | null;
  uploaded: boolean;
  defaultAlt: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<"upload" | "reset" | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
        {image ? (
          <Image src={image.src} alt={image.alt} fill sizes="160px" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-xs text-slate-500">Hidden until uploaded</span>
        )}
      </div>
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy("upload");
          setError(null);
          const formData = new FormData(e.currentTarget);
          formData.set("slot", slot);
          const result = await uploadPhoto(id, formData).catch(() => ({
            ok: false as const,
            error: "Upload failed. Check your connection and try again.",
          }));
          setBusy(null);
          if (!result.ok) return setError(result.error);
          toast.show(result.message ?? "Photo uploaded");
          (e.target as HTMLFormElement).reset();
          router.refresh();
        }}
      >
        <p className="text-sm font-semibold text-slate-800">
          {SLOT_LABELS[slot]}{" "}
          <span className="font-normal text-slate-500">· {uploaded ? "uploaded" : image ? "stock" : "empty"}</span>
        </p>
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-label={`${SLOT_LABELS[slot]} file`}
          className="block w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:font-semibold file:text-slate-800"
        />
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Describe the photo (alt text)</span>
          <input
            name="alt"
            required
            minLength={5}
            maxLength={200}
            defaultValue={uploaded && image ? image.alt : defaultAlt}
            className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!!busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busy === "upload" && <Spinner />}
            Upload
          </button>
          {uploaded && (
            <button
              type="button"
              disabled={!!busy}
              onClick={async () => {
                setBusy("reset");
                const result = await resetPhoto(id, slot);
                setBusy(null);
                if (!result.ok) return setError(result.error);
                toast.show(result.message ?? "Reset");
                router.refresh();
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {busy === "reset" && <Spinner />}
              Use stock photo
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
