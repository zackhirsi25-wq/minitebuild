import Link from "next/link";
import type { ReactNode } from "react";

// A small Markdown renderer for the legal pages: headings, paragraphs, "- "
// lists, **bold** and [links](/path). Enough for owner-supplied documents
// without pulling in a Markdown library. Text is rendered as React text, so
// nothing in the document can inject HTML.

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1] !== undefined) {
      out.push(<strong key={key}>{m[1]}</strong>);
    } else {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={key} href={href}>
            {m[2]}
          </Link>
        ) : (
          <a key={key} href={href}>
            {m[2]}
          </a>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (para.length) {
      // Single newlines inside a paragraph become line breaks (address blocks).
      const k = `p${blocks.length}`;
      blocks.push(
        <p key={k}>
          {para.flatMap((line, j) =>
            j === 0 ? inline(line, `${k}-${j}`) : [<br key={`${k}-br${j}`} />, ...inline(line, `${k}-${j}`)],
          )}
        </p>,
      );
      para = [];
    }
    if (list.length) {
      const k = `ul${blocks.length}`;
      blocks.push(
        <ul key={k}>
          {list.map((item, j) => (
            <li key={j}>{inline(item, `${k}-${j}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flush();
      const Tag = `h${heading[1].length}` as "h1" | "h2" | "h3";
      blocks.push(<Tag key={`h${blocks.length}`}>{inline(heading[2], `h${blocks.length}`)}</Tag>);
    } else if (/^- /.test(line)) {
      if (para.length) flush();
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flush();
    } else {
      if (list.length) flush();
      para.push(line.trim());
    }
  }
  flush();
  return <div className={className}>{blocks}</div>;
}
