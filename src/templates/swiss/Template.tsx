import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
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
import "./swiss.css";

// Swiss: everything sits on a 12-column grid that is drawn faintly on the
// page; the hero photo is the one thing that breaks out of it.

const font = Inter_Tight({ subsets: ["latin"], variable: "--swi-font" });

function Lines() {
  return (
    <div className="swi-lines" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

function Section({ id, n, title, children }: { id?: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`swi-${n}`} className="swi-section">
      <div className="swi-wrap">
        <Lines />
        <div className="swi-grid">
          <div className="swi-opener">
            <span className="swi-num" aria-hidden="true">
              {String(n).padStart(2, "0")}
            </span>
            <h2 id={`swi-${n}`} className="swi-h2">
              {title}
            </h2>
          </div>
          <div className="swi-content" data-reveal>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SwissTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);
  let n = 0;

  return (
    <div data-site className={`tpl swi ${font.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="swi-skip" />
      <header data-site-header className="swi-header">
        <div className="swi-wrap">
          <div className="swi-grid">
            <a href="#top" className="swi-name">
              {site.name}
            </a>
            <span className="swi-header-meta swi-small swi-grey">{site.city}</span>
            <a href={tel} className="swi-header-meta swi-small">
              {site.phone}
            </a>
            <a href={tel} className="swi-btn">
              Call now
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="swi-h1" className="swi-wrap swi-hero">
          <Lines />
          <div className="swi-grid" style={{ rowGap: "var(--sp-8)" }}>
            <h1 id="swi-h1" className="swi-display" data-enter="1">
              {content.headline}
            </h1>
            <p className="swi-lead swi-hero-lead" data-enter="2">
              {content.subheadline}
            </p>
            <div className="swi-hero-actions" data-enter="3">
              <a href={tel} className="swi-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
            <dl className="swi-facts" data-enter="4">
              <div>
                <dt>Location</dt>
                <dd>{site.city}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={tel}>{site.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Today</dt>
                <dd>{site.hours.length ? <OpenStatus hours={site.hours} /> : "Call to ask"}</dd>
              </div>
              <div>
                <dt>Services</dt>
                <dd>{content.services.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {hero && (
          <div className="swi-photo-band">
            <div className="swi-photo" data-reveal>
              <Photo image={hero} sizes="(min-width: 1024px) 70vw, 100vw" preload />
            </div>
          </div>
        )}

        <Section id="services" n={++n} title="What we do">
          <ol className="swi-list">
            {content.services.map((s, i) => (
              <li key={s.title}>
                <span>{i + 1}</span>
                <h3 className="swi-h3">{s.title}</h3>
                <p className="swi-body swi-grey">{s.description}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="about" n={++n} title={`About ${site.name}`}>
          <div className="swi-about" style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)" }}>
            <div style={{ display: "grid", gap: 20 }}>
              {lead && <p className="swi-lead">{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="swi-body swi-grey">
                  {p}
                </p>
              ))}
            </div>
            {about && (
              <div className="swi-about-photo">
                <Photo image={about} sizes="420px" />
              </div>
            )}
          </div>
        </Section>

        {work.length > 0 && (
          <Section id="work" n={++n} title="Recent work">
            <ul className="swi-work">
              {work.map((image) => (
                <li key={image.src}>
                  <Photo image={image} sizes="(min-width: 768px) 32vw, 100vw" />
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section n={++n} title="How it works">
          <ol className="swi-steps">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className="swi-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="swi-h3">{step.title}</h3>
                <p className="swi-body swi-grey">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section n={++n} title="Where we work">
          <ul className="swi-areas">
            {content.serviceAreas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>

        <Section id="questions" n={++n} title="Questions">
          <Faq items={content.faq} className="swi-faq" answerClass="swi-body swi-grey" />
        </Section>

        <section aria-labelledby="swi-cta-h" className="swi-section swi-cta">
          <div className="swi-wrap">
            <div className="swi-grid" data-reveal>
              <h2 id="swi-cta-h" className="swi-h2" style={{ gridColumn: "1 / -1" }}>
                {content.cta.heading}
              </h2>
              <a href={tel} className="swi-cta-phone" style={{ gridColumn: "1 / -1" }}>
                {site.phone}
              </a>
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px 32px",
                  alignItems: "center",
                }}
              >
                <a href={tel} className="swi-btn">
                  <PhoneGlyph />
                  {content.cta.buttonLabel}
                </a>
                <p className="swi-body">{content.cta.body}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="swi-footer">
        <div className="swi-wrap">
          <div className="swi-grid swi-small">
            <div>
              <p style={{ fontWeight: 700 }}>{site.name}</p>
              <p className="swi-grey">© {year()}</p>
            </div>
            <div>
              <p className="swi-grey">Phone</p>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <p className="swi-grey">{site.address ? "Address" : "Location"}</p>
              <address>{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <p className="swi-grey">Hours</p>
                <ul>
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="swi-callbar">
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
