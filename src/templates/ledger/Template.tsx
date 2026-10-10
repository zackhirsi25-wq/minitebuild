import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { telHref } from "@/lib/content/phone";
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
import "./ledger.css";

// Ledger: one sheet of paper. Services are a typeset index with dotted
// leaders; details are set in mono like figures on a statement.

const font = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--led-font" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--led-mono" });

function Section({ id, n, title, children }: { id?: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`led-${n}`} className="led-section led-pad">
      <div className="led-head">
        <span className="led-mono led-muted" aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        <h2 id={`led-${n}`} className="led-h2">
          {title}
        </h2>
      </div>
      <div data-reveal>{children}</div>
    </section>
  );
}

export default function LedgerTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);
  let n = 0;

  return (
    <div data-site className={`tpl led ${font.variable} ${mono.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="led-skip" />
      <div className="led-sheet">
        <header data-site-header className="led-header">
          <div className="led-pad led-header-inner">
            <a href="#top" className="led-name">
              {site.name}
            </a>
            <a href={tel} className="led-mono">
              {site.phone}
            </a>
          </div>
        </header>

        <main id="main">
          <section id="top" aria-labelledby="led-h1" className="led-pad led-hero">
            <p className="led-mono led-muted" data-enter="1">
              {site.category ?? "Local business"}, {site.city}
            </p>
            <h1 id="led-h1" className="led-display" data-enter="1">
              {content.headline}
            </h1>
            <p
              className="led-body led-muted"
              data-enter="2"
              style={{ fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)" }}
            >
              {content.subheadline}
            </p>
            <div data-enter="3">
              <a href={tel} className="led-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
            <dl className="led-meta led-mono" data-enter="4">
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={tel}>{site.phone}</a>
                </dd>
              </div>
              <div>
                <dt>City</dt>
                <dd>{site.city}</dd>
              </div>
              <div>
                <dt>Today</dt>
                <dd>{site.hours.length ? <OpenStatus hours={site.hours} /> : "Call to ask"}</dd>
              </div>
              <div>
                <dt>Services</dt>
                <dd>{String(content.services.length).padStart(2, "0")}</dd>
              </div>
            </dl>
            {hero && (
              <div className="led-photo" data-enter="4">
                <Photo image={hero} sizes="820px" preload />
              </div>
            )}
          </section>

          <Section id="services" n={++n} title="Services">
            <ol className="led-index">
              {content.services.map((s, i) => (
                <li key={s.title}>
                  <div className="led-index-row">
                    <h3 className="led-h3">{s.title}</h3>
                    <span className="led-leader" aria-hidden="true" />
                    <span className="led-mono led-muted">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="led-body">{s.description}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="about" n={++n} title={`About ${site.name}`}>
            <div style={{ display: "grid", gap: 20 }}>
              {lead && <p style={{ fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", lineHeight: 1.55 }}>{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="led-body led-muted">
                  {p}
                </p>
              ))}
              {about && (
                <div className="led-photo">
                  <Photo image={about} sizes="820px" />
                </div>
              )}
            </div>
          </Section>

          <Section n={++n} title="How it works">
            <ol className="led-steps">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className="led-mono led-muted">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="led-h3">{step.title}</h3>
                    <p className="led-body led-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section n={++n} title="Areas served">
            <p className="led-mono" style={{ fontSize: "0.9375rem", lineHeight: 1.9 }}>
              {content.serviceAreas.join(", ")}.
            </p>
          </Section>

          <Section id="questions" n={++n} title="Questions">
            <Faq items={content.faq} className="led-faq" answerClass="led-body" />
          </Section>

          <section aria-labelledby="led-cta-h" className="led-section led-pad">
            <div className="led-cta" data-reveal>
              <h2 id="led-cta-h" className="led-h2">
                {content.cta.heading}
              </h2>
              <p className="led-body led-muted">{content.cta.body}</p>
              <a href={tel} className="led-cta-phone">
                {site.phone}
              </a>
              <a href={tel} className="led-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
          </section>
        </main>

        <footer className="led-footer led-pad">
          <div className="led-footer-grid led-mono">
            <div>
              <p>{site.name}</p>
              <p className="led-muted">© {year()}</p>
            </div>
            <div>
              <p className="led-muted">{site.address ? "Address" : "City"}</p>
              <address>{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <p className="led-muted">Hours</p>
                <ul>
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </footer>
      </div>

      <CallBar phone={site.phone} name={site.name} className="led-callbar">
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
