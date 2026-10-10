import { Space_Grotesk, Space_Mono } from "next/font/google";
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
import "./brutal.css";

// Brutal: every element is a box with a thick outline and a hard shadow;
// buttons press flat into the page when tapped.

const font = Space_Grotesk({ subsets: ["latin"], variable: "--bru-font" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--bru-mono" });

export default function BrutalTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl bru ${font.variable} ${mono.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="bru-skip" />
      <header data-site-header className="bru-header">
        <div className="bru-header-inner">
          <a href="#top" className="bru-name">
            {site.name}
          </a>
          <a href={tel} className="bru-btn">
            <PhoneGlyph />
            Call
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="bru-h1" className="bru-wrap bru-hero">
          <div className="bru-box bru-hero-card" data-enter="1">
            <span className="bru-sticker">{site.hours.length ? <OpenStatus hours={site.hours} /> : site.city}</span>
            <h1 id="bru-h1" className="bru-display">
              {content.headline}
            </h1>
            <p className="bru-body" data-enter="2" style={{ fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)" }}>
              {content.subheadline}
            </p>
            <a href={tel} className="bru-btn" data-enter="3">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
          <div className="bru-hero-side" data-enter="4">
            {hero && (
              <div className="bru-box bru-frame bru-frame--tilt">
                <Photo image={hero} sizes="(min-width: 1024px) 40vw, 100vw" preload />
              </div>
            )}
            <a href={tel} className="bru-box bru-fill bru-ticket">
              <span className="bru-mono">Call {site.name}</span>
              <strong>{site.phone}</strong>
            </a>
            {!hero && (
              <div className="bru-box" style={{ padding: 24, display: "grid", gap: 8 }}>
                <span className="bru-mono bru-muted">We do</span>
                <ul style={{ display: "grid", gap: 4 }}>
                  {content.services.map((s) => (
                    <li key={s.title} className="bru-h3">
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section id="services" aria-labelledby="bru-services-h" className="bru-section">
          <div className="bru-wrap">
            <h2 id="bru-services-h" className="bru-h2">
              What we do
            </h2>
            <div className="bru-cards">
              {content.services.map((s, i) => (
                <article key={s.title} className="bru-box bru-card" data-reveal>
                  <span className="bru-mono">[{String(i + 1).padStart(2, "0")}]</span>
                  <h3 className="bru-h3">{s.title}</h3>
                  <p className="bru-body">{s.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" aria-labelledby="bru-about-h" className="bru-section" style={{ paddingTop: 0 }}>
          <div className="bru-wrap">
            <div
              className="bru-box bru-about"
              data-reveal
              style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)" }}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <h2 id="bru-about-h" className="bru-h2">
                  About us
                </h2>
                {lead && (
                  <p className="bru-h3" style={{ fontWeight: 500, lineHeight: 1.4 }}>
                    {lead}
                  </p>
                )}
                {rest.map((p) => (
                  <p key={p.slice(0, 32)} className="bru-body bru-muted">
                    {p}
                  </p>
                ))}
              </div>
              {about && (
                <div className="bru-box bru-frame bru-about-photo">
                  <Photo image={about} sizes="420px" />
                </div>
              )}
            </div>
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="bru-work-h" className="bru-section" style={{ paddingTop: 0 }}>
            <div className="bru-wrap">
              <h2 id="bru-work-h" className="bru-h2">
                Recent work
              </h2>
              <ul className="bru-work">
                {work.map((image) => (
                  <li key={image.src} data-reveal>
                    <div className="bru-box bru-frame">
                      <Photo image={image} sizes="(min-width: 900px) 25vw, 50vw" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="bru-how-h" className="bru-section" style={{ paddingTop: 0 }}>
          <div className="bru-wrap">
            <h2 id="bru-how-h" className="bru-h2">
              How it works
            </h2>
            <ol className="bru-steps">
              {steps.map((step, i) => (
                <li key={step.title} className="bru-step" data-reveal>
                  <span className="bru-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="bru-h3">{step.title}</h3>
                  <p className="bru-body bru-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="bru-areas-h" className="bru-section" style={{ paddingTop: 0 }}>
          <div className="bru-wrap">
            <h2 id="bru-areas-h" className="bru-h2">
              Where to find us
            </h2>
            <ul className="bru-tags" data-reveal>
              {content.serviceAreas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" aria-labelledby="bru-faq-h" className="bru-section" style={{ paddingTop: 0 }}>
          <div className="bru-wrap">
            <h2 id="bru-faq-h" className="bru-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="bru-faq" answerClass="bru-body" />
          </div>
        </section>

        <section aria-labelledby="bru-cta-h" className="bru-section bru-cta">
          <div className="bru-wrap bru-cta-inner" data-reveal>
            <h2 id="bru-cta-h" className="bru-h2">
              {content.cta.heading}
            </h2>
            <a href={tel} className="bru-cta-phone">
              {site.phone}
            </a>
            <p className="bru-body">{content.cta.body}</p>
            <a href={tel} className="bru-btn bru-btn--dark">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="bru-footer">
        <div className="bru-wrap">
          <div className="bru-footer-grid">
            <div>
              <h2>{site.name}</h2>
              <p className="bru-muted">{content.services.map((s) => s.title).join(" / ")}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="bru-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul className="bru-mono bru-muted">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="bru-mono bru-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="bru-callbar">
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
