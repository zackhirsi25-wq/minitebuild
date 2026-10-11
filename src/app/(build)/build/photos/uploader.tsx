"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cx } from "@/components/ui/cx";
import type { DraftPhoto } from "@/lib/build/draft";
import { removeBuildImage, uploadBuildImage } from "../actions";

type Item = {
  key: string;
  photo?: DraftPhoto;
  status: "uploading" | "done" | "error";
  error?: string;
  preview?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif";

/** Logo + up to 10 photos. Each file uploads on its own, so one bad file never blocks the rest. */
export function Uploader({
  photos,
  logo,
  publicUrl,
  max,
}: {
  photos: DraftPhoto[];
  logo: DraftPhoto | null;
  publicUrl: string;
  max: number;
}) {
  const [items, setItems] = useState<Item[]>(photos.map((p) => ({ key: p.path, photo: p, status: "done" })));
  const [logoItem, setLogoItem] = useState<Item | null>(logo ? { key: logo.path, photo: logo, status: "done" } : null);
  const photoInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const url = (p: DraftPhoto) => `${publicUrl}/${p.path}`;
  const room = max - items.filter((i) => i.status !== "error").length;

  async function upload(file: File, kind: "photo" | "logo", key: string) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", kind);
    const result = await uploadBuildImage(fd).catch(() => ({
      ok: false as const,
      error: "Upload failed. Check your connection.",
    }));
    const update = (i: Item): Item =>
      i.key !== key
        ? i
        : result.ok
          ? { key, photo: result.photo, status: "done", preview: i.preview }
          : { ...i, status: "error", error: result.error };
    if (kind === "logo") setLogoItem((i) => (i ? update(i) : i));
    else setItems((list) => list.map(update));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const chosen = [...files].slice(0, Math.max(0, room));
    const added = chosen.map((file) => ({
      key: `${file.name}-${crypto.randomUUID()}`,
      status: "uploading" as const,
      preview: URL.createObjectURL(file),
      file,
    }));
    setItems((list) => [...list, ...added.map((a) => ({ key: a.key, status: a.status, preview: a.preview }))]);
    added.forEach((a) => upload(a.file, "photo", a.key));
  }

  function setLogo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const key = `logo-${crypto.randomUUID()}`;
    setLogoItem({ key, status: "uploading", preview: URL.createObjectURL(file) });
    upload(file, "logo", key);
  }

  async function remove(item: Item, kind: "photo" | "logo") {
    if (item.photo) await removeBuildImage(item.photo.path);
    if (kind === "logo") setLogoItem(null);
    else setItems((list) => list.filter((i) => i.key !== item.key));
  }

  const tile = (item: Item, kind: "photo" | "logo") => (
    <li key={item.key} className="relative aspect-square overflow-hidden rounded-[12px] border border-line bg-raised">
      {item.photo ? (
        <Image
          src={url(item.photo)}
          alt=""
          fill
          sizes="160px"
          className={kind === "logo" ? "object-contain p-3" : "object-cover"}
          unoptimized
        />
      ) : item.preview ? (
        // Local preview while uploading.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.preview} alt="" className="h-full w-full object-cover opacity-50" />
      ) : null}
      {item.status === "uploading" && (
        <span className="absolute inset-x-2 bottom-2 rounded-full bg-canvas/80 px-2 py-1 text-center text-[11px] text-fg">
          Uploading…
        </span>
      )}
      {item.status === "error" && (
        <span
          role="alert"
          className="absolute inset-0 grid place-items-center bg-canvas/85 p-2 text-center text-[12px] text-danger"
        >
          {item.error}
        </span>
      )}
      {item.status !== "uploading" && (
        <button
          type="button"
          onClick={() => remove(item, kind)}
          aria-label="Remove"
          className="absolute top-1.5 right-1.5 grid h-11 w-11 place-items-center rounded-full text-fg"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-canvas/85 text-[15px] leading-none">×</span>
        </button>
      )}
    </li>
  );

  return (
    <div className="grid gap-10">
      <section aria-labelledby="photos-h">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="photos-h" className="text-lead font-semibold">
            Photos
          </h2>
          <p className="text-small text-muted">
            {items.filter((i) => i.status === "done").length} of {max}
          </p>
        </div>
        <p className="mt-1 text-small text-muted">
          Your own work, your place or your team. JPEG, PNG, WebP or HEIC, up to 10 MB each.
        </p>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {items.map((i) => tile(i, "photo"))}
          {room > 0 && (
            <li>
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className={cx(
                  "grid aspect-square w-full place-items-center rounded-[12px] border border-dashed border-line-strong text-small text-muted transition-colors hover:border-fg/40 hover:text-fg",
                )}
              >
                <span className="grid justify-items-center gap-1">
                  <span aria-hidden="true" className="text-2xl leading-none">
                    +
                  </span>
                  Add photos
                </span>
              </button>
            </li>
          )}
        </ul>
        <input
          ref={photoInput}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => (addPhotos(e.target.files), (e.target.value = ""))}
        />
      </section>

      <section aria-labelledby="logo-h">
        <h2 id="logo-h" className="text-lead font-semibold">
          Logo <span className="font-normal text-muted">(optional)</span>
        </h2>
        <p className="mt-1 text-small text-muted">We use its main colour to pick your site&apos;s accent colour.</p>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {logoItem ? (
            tile(logoItem, "logo")
          ) : (
            <li>
              <button
                type="button"
                onClick={() => logoInput.current?.click()}
                className="grid aspect-square w-full place-items-center rounded-[12px] border border-dashed border-line-strong text-small text-muted transition-colors hover:border-fg/40 hover:text-fg"
              >
                <span className="grid justify-items-center gap-1">
                  <span aria-hidden="true" className="text-2xl leading-none">
                    +
                  </span>
                  Add logo
                </span>
              </button>
            </li>
          )}
        </ul>
        <input
          ref={logoInput}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => (setLogo(e.target.files), (e.target.value = ""))}
        />
      </section>
    </div>
  );
}
