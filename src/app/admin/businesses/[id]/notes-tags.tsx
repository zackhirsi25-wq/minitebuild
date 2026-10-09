"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { TAGS, type Tag } from "@/lib/content/schema";
import { saveNotes, setTag } from "../../actions";

export function NotesAndTags({ id, notes, tags }: { id: string; notes: string; tags: Tag[] }) {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = useState(notes);
  const [saved, setSaved] = useState(notes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [active, setActive] = useState<Set<Tag>>(new Set(tags));
  const [, startTransition] = useTransition();

  async function toggle(tag: Tag) {
    const on = !active.has(tag);
    const next = new Set(active);
    if (on) next.add(tag);
    else next.delete(tag);
    setActive(next);
    const result = await setTag(id, tag, on);
    if (!result.ok) {
      setActive(active);
      toast.show(result.error, "error");
    } else startTransition(() => router.refresh());
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">Tags</h2>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Tags">
        {TAGS.map((tag) => {
          const on = active.has(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(tag)}
              className={`min-h-11 rounded-full border px-4 text-sm font-medium transition ${
                on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {on ? "✓ " : ""}
              {tag}
            </button>
          );
        })}
      </div>

      <h2 className="mt-6 font-semibold">
        <label htmlFor="notes">Notes</label>
      </h2>
      <textarea
        id="notes"
        rows={5}
        value={text}
        maxLength={5000}
        onChange={(e) => setText(e.target.value)}
        placeholder="Calls, follow-ups, what they asked for…"
        className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500" aria-live="polite">
          {text !== saved ? "Unsaved" : saved ? "Saved" : ""}
        </span>
        <button
          type="button"
          disabled={text === saved || savingNotes}
          onClick={async () => {
            setSavingNotes(true);
            const result = await saveNotes(id, text);
            setSavingNotes(false);
            if (!result.ok) return toast.show(result.error, "error");
            setSaved(text);
            toast.show("Notes saved");
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
        >
          {savingNotes && <Spinner />}
          Save notes
        </button>
      </div>
    </section>
  );
}
