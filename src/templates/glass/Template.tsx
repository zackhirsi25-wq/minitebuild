import { Sora } from "next/font/google";
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
import "./glass.css";

// Glass: frosted panels over a colour field that drifts very slowly (still
// with reduced motion). Everything sits on glass; nothing sits on bare colour.

const font = Sora({ subsets: ["latin"], preload: false, variable: "--gla-font" });

export default function GlassTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const spaces = GALLERY_SLOTS.map((s) => images[s])
    .filter((i): i is SiteImage => !!i)
    .slice(0, 3);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl gla ${font.variable}`} style={paletteStyle(palette)}>
      <div className="gla-field" aria-hidden="true" />
      <SiteStart skipClass="gla-skip" />
      <header data-site-header className="gla-header">
        <div className="gla-panel gla-header-inner">
          <a href="#top" className="gla-name">
            {site.name}
          </a>
          <a href={tel} className="gla-btn">
            <PhoneGlyph />
            Call
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="gla-h1" className="gla-wrap gla-hero">
          <div data-enter="1" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            <span className="gla-pill">{site.city}</span>
            {site.hours.length > 0 && <OpenStatus hours={site.hours} className="gla-pill" dotClass="gla-pill-dot" />}
          </div>
          <h1 id="gla-h1" className="gla-display" data-enter="1">
            {content.headline}
          </h1>
          <p
            className="gla-body"
            data-enter="2"
            style={{ fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.3rem)", maxWidth: "46ch" }}
          >
            {content.subheadline}
          </p>
          <a href={tel} className="gla-btn" data-enter="3">
            <PhoneGlyph />
            {content.cta.buttonLabel}
          </a>
          {hero && (
            <div className="gla-panel gla-frame gla-hero-frame" data-enter="4">
              <div className="gla-frame-inner">
                <Photo image={hero} sizes="(min-width: 1200px) 1180px, 100vw" preload />
              </div>
            </div>
          )}
        </section>

        <section id="services" aria-labelledby="gla-services-h" className="gla-section" style={{ paddingTop: 0 }}>
          <div className="gla-wrap">
            <h2 id="gla-services-h" className="gla-h2">
              What we offer
            </h2>
            <div className={content.services.length === 4 ? "gla-cards gla-cards--4" : "gla-cards"}>
              {content.services.map((s) => (
                <article key={s.title} className="gla-panel gla-card" data-reveal>
                  <span className="gla-card-icon" aria-hidden="true" />
                  <h3 className="gla-h3">{s.title}</h3>
                  <p className="gla-body">{s.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" aria-labelledby="gla-about-h" className="gla-section" style={{ paddingTop: 0 }}>
          <div className="gla-wrap">
            <div
              className="gla-panel gla-about"
              data-reveal
              style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)" }}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <h2 id="gla-about-h" className="gla-h2">
                  About {site.name}
                </h2>
                {lead && (
                  <p style={{ fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", lineHeight: 1.55 }}>{lead}</p>
                )}
                {rest.map((p) => (
                  <p key={p.slice(0, 32)} className="gla-body">
                    {p}
                  </p>
                ))}
              </div>
              {about && (
                <div className="gla-frame" style={{ padding: 0 }}>
                  <div className="gla-frame-inner">
                    <Photo image={about} sizes="(min-width: 900px) 40vw, 100vw" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {spaces.length > 0 && (
          <section id="work" aria-labelledby="gla-work-h" className="gla-section" style={{ paddingTop: 0 }}>
            <div className="gla-wrap">
              <h2 id="gla-work-h" className="gla-h2">
                Our space
              </h2>
              <ul className="gla-spaces">
                {spaces.map((image) => (
                  <li key={image.src} className="gla-panel gla-frame" data-reveal>
                    <div className="gla-frame-inner" style={{ aspectRatio: "4 / 3" }}>
                      <Photo image={image} sizes="(min-width: 768px) 33vw, 100vw" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="gla-how-h" className="gla-section" style={{ paddingTop: 0 }}>
          <div className="gla-wrap">
            <h2 id="gla-how-h" className="gla-h2">
              How it works
            </h2>
            <ol className="gla-panel gla-track" data-reveal>
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className="gla-track-dot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="gla-h3">{step.title}</h3>
                  <p className="gla-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="gla-areas-h" className="gla-section" style={{ paddingTop: 0 }}>
          <div className="gla-wrap">
            <h2 id="gla-areas-h" className="gla-h2">
              Where we are
            </h2>
            <ul className="gla-areas" data-reveal>
              {content.serviceAreas.map((a) => (
                <li key={a} className="gla-pill">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" aria-labelledby="gla-faq-h" className="gla-section" style={{ paddingTop: 0 }}>
          <div className="gla-wrap">
            <h2 id="gla-faq-h" className="gla-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="gla-faq" />
          </div>
        </section>

        <section aria-labelledby="gla-cta-h" className="gla-section" style={{ paddingTop: 0 }}>
          <div className="gla-wrap">
            <div className="gla-panel gla-cta" data-reveal>
              <h2 id="gla-cta-h" className="gla-h2">
                {content.cta.heading}
              </h2>
              <p className="gla-body">{content.cta.body}</p>
              <a href={tel} className="gla-cta-phone">
                {site.phone}
              </a>
              <a href={tel} className="gla-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="gla-footer">
        <div className="gla-wrap">
          <div className="gla-footer-grid gla-small">
            <div>
              <h2>{site.name}</h2>
              <p className="gla-muted">{content.services.map((s) => s.title).join(" · ")}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="gla-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul className="gla-muted">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="gla-small gla-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="gla-callbar">
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
