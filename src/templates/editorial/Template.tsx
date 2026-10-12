import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { GALLERY_SLOTS } from "@/lib/content/schema";
import { telHref } from "@/lib/content/phone";
import type { SiteImage } from "@/lib/images/stock";
import { paragraphs, processSteps } from "../_kit/content";
import { SiteMotion } from "../_kit/motion";
import { OpenStatus } from "../_kit/open-status";
import { paletteStyle } from "../_kit/palette";
import { CallBar, Faq, PhoneGlyph, SiteStart, year } from "../_kit/parts";
import { Photo } from "../_kit/photo";
import type { TemplateProps } from "../_kit/types";
import "../_kit/kit.css";
import "../_kit/base.css";
import "./tokens.css";
import "./editorial.css";

// Editorial: "The weekend edition". The business name is the masthead; the
// dateline under it shows the city, today's opening status and the phone.

const serif = Instrument_Serif({
  subsets: ["latin"],
  preload: false,
  weight: "400",
  style: ["normal", "italic"],
  variable: "--edi-serif",
});
const sans = Instrument_Sans({ subsets: ["latin"], preload: false, variable: "--edi-sans" });

function Chapter({ n, id, title }: { n: number; id: string; title: string }) {
  return (
    <div className="edi-chapter">
      <span className="edi-chapter-num" aria-hidden="true">
        No. {n}
      </span>
      <h2 id={id} className="edi-h2">
        {title}
      </h2>
    </div>
  );
}

export default function EditorialTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [first, ...rest] = paragraphs(content.about);
  let n = 0;

  return (
    <div data-site className={`tpl edi ${serif.variable} ${sans.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="edi-skip" />
      <header data-site-header className="edi-header">
        <div className="edi-wrap edi-header-inner">
          <a href="#top" className="edi-header-name" tabIndex={-1} aria-hidden="true">
            {site.name}
          </a>
          <nav aria-label="Sections">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#questions">Questions</a>
          </nav>
          <a href={tel} className="edi-btn">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <div id="top" className="edi-wrap edi-masthead">
          <h1 data-enter="1">{site.name}</h1>
          <p className="edi-dateline edi-small" data-enter="2">
            <span>{site.city}</span>
            <OpenStatus hours={site.hours} className="edi-open" dotClass="edi-open-dot" />
            <a href={tel}>{site.phone}</a>
          </p>
        </div>

        <section
          aria-labelledby="edi-headline"
          className={hero ? "edi-wrap edi-cover" : "edi-wrap edi-cover edi-cover--type"}
        >
          {hero && (
            <div className="edi-cover-photo" data-enter="3">
              <Photo image={hero} sizes="(min-width: 1024px) 52vw, 100vw" preload />
            </div>
          )}
          <div className="edi-cover-text">
            <h2 id="edi-headline" className="edi-display" data-enter="3">
              {content.headline}
            </h2>
            <p className="edi-lead" data-enter="4">
              {content.subheadline}
            </p>
            <div data-enter="4" style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "center" }}>
              <a href={tel} className="edi-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
              <a href="#services" className="edi-link">
                Read on
              </a>
            </div>
          </div>
        </section>

        <section id="services" aria-labelledby="edi-services-h" className="edi-section" style={{ paddingTop: 0 }}>
          <div className="edi-wrap">
            <Chapter n={++n} id="edi-services-h" title="What we do" />
            <div className="edi-columns">
              {content.services.map((s) => (
                <article key={s.title} data-reveal>
                  <h3>{s.title}</h3>
                  <p className="edi-body edi-muted">{s.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" aria-labelledby="edi-about-h" className="edi-section edi-night">
          <div className="edi-wrap">
            <Chapter n={++n} id="edi-about-h" title={`About ${site.name}`} />
            <div className="edi-spread" style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)" }}>
              {about && (
                <div className="edi-spread-photo" data-reveal>
                  <Photo image={about} sizes="(min-width: 1024px) 44vw, 100vw" />
                </div>
              )}
              <div className="edi-spread-text" data-reveal style={about ? undefined : { maxWidth: "48rem" }}>
                {first && <p className="edi-first">{first}</p>}
                {rest.map((p) => (
                  <p key={p.slice(0, 32)} className="edi-body edi-muted">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="edi-work-h" className="edi-section">
            <div className="edi-wrap">
              <Chapter n={++n} id="edi-work-h" title="From the archive" />
              <ul className="edi-sheet">
                {work.map((image, i) => (
                  <li key={image.src} data-frame={String(i + 1).padStart(2, "0")}>
                    <Photo image={image} sizes="(min-width: 900px) 16vw, 44vw" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section
          aria-labelledby="edi-how-h"
          className="edi-section"
          style={work.length ? { paddingTop: 0 } : undefined}
        >
          <div className="edi-wrap">
            <Chapter n={++n} id="edi-how-h" title="How it works" />
            <ol className="edi-steps">
              {steps.map((step, i) => (
                <li key={step.title} data-reveal>
                  <em aria-hidden="true">{i + 1}</em>
                  <h3 className="edi-serif">{step.title}</h3>
                  <p className="edi-body edi-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="edi-areas-h" className="edi-section" style={{ paddingTop: 0 }}>
          <div className="edi-wrap">
            <Chapter n={++n} id="edi-areas-h" title="Where we work" />
            <ol className="edi-index" data-reveal>
              {content.serviceAreas.map((a, i) => (
                <li key={a}>
                  {a}
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="questions" aria-labelledby="edi-faq-h" className="edi-section" style={{ paddingTop: 0 }}>
          <div className="edi-wrap">
            <Chapter n={++n} id="edi-faq-h" title="Questions" />
            <Faq items={content.faq} className="edi-faq" answerClass="edi-body edi-muted" />
          </div>
        </section>

        <section aria-labelledby="edi-cta-h" className="edi-section edi-night">
          <div className="edi-wrap edi-cta" data-reveal>
            <h2 id="edi-cta-h" className="edi-h2">
              {content.cta.heading}
            </h2>
            <p className="edi-lead edi-muted">{content.cta.body}</p>
            <a href={tel} className="edi-cta-phone">
              {site.phone}
            </a>
            <a href={tel} className="edi-btn">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="edi-footer">
        <div className="edi-wrap">
          <p className="edi-footer-name">{site.name}</p>
          <div className="edi-footer-cols edi-small">
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Where"}</h2>
              <address className="edi-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul className="edi-muted">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="edi-small edi-muted" style={{ marginTop: 32, textAlign: "center" }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="edi-callbar">
        <span>{site.phone}</span>
        <strong>
          <PhoneGlyph />
          Call now
        </strong>
      </CallBar>
      <SiteMotion />
    </div>
  );
}
