import { Archivo } from "next/font/google";
import { GALLERY_SLOTS } from "@/lib/content/schema";
import { telHref } from "@/lib/content/phone";
import type { SiteImage } from "@/lib/images/stock";
import { paragraphs, processSteps } from "../_kit/content";
import { SiteMotion } from "../_kit/motion";
import { paletteStyle } from "../_kit/palette";
import { CallBar, Faq, PhoneGlyph, SiteStart, year } from "../_kit/parts";
import { Photo } from "../_kit/photo";
import type { TemplateProps } from "../_kit/types";
import "../_kit/kit.css";
import "../_kit/base.css";
import "./tokens.css";
import "./impact.css";

// Impact: "Signal". Condensed type, hard rules, one signal colour, and the
// phone number set as the closing headline.

const font = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--imp-font" });

export default function ImpactTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl imp ${font.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="imp-skip" />
      <header data-site-header className="imp-header">
        <div className="imp-wrap imp-header-inner">
          <a href="#top" className="imp-name">
            {site.name}
          </a>
          <a href={tel} className="imp-header-phone">
            {site.phone}
          </a>
          <a href={tel} className="imp-btn imp-btn--small">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="imp-h1" className="imp-hero">
          <div className="imp-hero-text">
            <h1 id="imp-h1" className="imp-display" data-enter="1">
              {content.headline}
            </h1>
            <p className="imp-body" data-enter="2" style={{ fontSize: "clamp(1.0625rem, 1rem + 0.4vw, 1.3rem)" }}>
              {content.subheadline}
            </p>
            <div className="imp-hero-actions" data-enter="3">
              <a href={tel} className="imp-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
              <a href="#services" className="imp-link">
                What we do ↓
              </a>
            </div>
          </div>
          {hero ? (
            <div className="imp-hero-photo">
              <Photo image={hero} sizes="(min-width: 1024px) 48vw, 100vw" preload />
            </div>
          ) : (
            <div className="imp-hero-call" data-enter="4">
              <p className="imp-small">Call {site.name}</p>
              <a href={tel}>{site.phone}</a>
            </div>
          )}
        </section>

        <section id="services" aria-labelledby="imp-services-h" className="imp-section">
          <div className="imp-wrap">
            <div className="imp-index-head">
              <h2 id="imp-services-h" className="imp-h2">
                What we do
              </h2>
              <p className="imp-small imp-muted">
                {content.services.length} services · {site.city}
              </p>
            </div>
            <ol className="imp-index">
              {content.services.map((s, i) => (
                <li key={s.title} data-reveal>
                  <div className="imp-index-row">
                    <span className="imp-index-num">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="imp-h2">{s.title}</h3>
                    <p className="imp-body imp-muted">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" aria-labelledby="imp-about-h" className="imp-section imp-about">
          <div className="imp-wrap imp-about-grid">
            <div className="imp-about-text" data-reveal>
              <h2 id="imp-about-h" className="imp-h2">
                About {site.name}
              </h2>
              {lead && (
                <p className="imp-h3" style={{ fontWeight: 600, fontVariationSettings: '"wdth" 90', lineHeight: 1.25 }}>
                  {lead}
                </p>
              )}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="imp-body">
                  {p}
                </p>
              ))}
            </div>
            {about && (
              <div className="imp-about-photo" data-reveal>
                <Photo image={about} sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            )}
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="imp-work-h" className="imp-section">
            <div className="imp-wrap">
              <h2 id="imp-work-h" className="imp-h2">
                Recent work
              </h2>
              <ul className="imp-work">
                {work.map((image) => (
                  <li key={image.src} data-reveal>
                    <Photo image={image} sizes="(min-width: 900px) 33vw, 50vw" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="imp-how-h" className="imp-section imp-how">
          <div className="imp-wrap">
            <h2 id="imp-how-h" className="imp-h2">
              How it works
            </h2>
            <ol className="imp-steps">
              {steps.map((step, i) => (
                <li key={step.title} className="imp-step" data-reveal>
                  <span className="imp-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="imp-h3">{step.title}</h3>
                  <p className="imp-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="imp-areas-h" className="imp-section imp-dark">
          <div className="imp-wrap">
            <h2 id="imp-areas-h" className="imp-h2">
              Where we work
            </h2>
            <ul className="imp-areas" data-reveal>
              {content.serviceAreas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" aria-labelledby="imp-faq-h" className="imp-section">
          <div className="imp-wrap">
            <h2 id="imp-faq-h" className="imp-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="imp-faq" answerClass="imp-body imp-muted" />
          </div>
        </section>

        <section aria-labelledby="imp-cta-h" className="imp-section imp-cta">
          <div className="imp-wrap" data-reveal>
            <h2 id="imp-cta-h" className="imp-h3">
              {content.cta.heading}
            </h2>
            <a href={tel} className="imp-cta-phone" aria-label={`Call ${site.phone}`}>
              {site.phone}
            </a>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 32px", alignItems: "center" }}>
              <a href={tel} className="imp-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
              <p className="imp-body imp-muted">{content.cta.body}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="imp-footer imp-dark">
        <div className="imp-wrap">
          <div className="imp-footer-grid">
            <div>
              <h2>{site.name}</h2>
              <p className="imp-muted">{content.services.map((s) => s.title).join(" · ")}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel} style={{ fontWeight: 700 }}>
                {site.phone}
              </a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="imp-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 ? (
              <div>
                <h2>Hours</h2>
                <ul className="imp-muted imp-small" style={{ fontWeight: 500 }}>
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div />
            )}
          </div>
          <p className="imp-small imp-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="imp-callbar">
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
