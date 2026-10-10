import { Plus_Jakarta_Sans } from "next/font/google";
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
import "./bento.css";

// Bento: the opening screen is a grid of tiles (headline, photo, phone,
// opening status, areas) so the essentials are visible without scrolling.

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--ben-font" });

export default function BentoTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const detail = images.detail ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl ben ${font.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="ben-skip" />
      <header data-site-header className="ben-header">
        <div className="ben-header-inner">
          <a href="#top" className="ben-name">
            {site.name}
          </a>
          <nav aria-label="Sections">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#questions">Questions</a>
          </nav>
          <a href={tel} className="ben-btn">
            <PhoneGlyph />
            Call
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="ben-h1" className="ben-wrap ben-hero">
          <div className="ben-grid ben-hero-grid">
            <div className="ben-tile ben-hero-main" data-enter="1">
              <h1 id="ben-h1" className="ben-display">
                {content.headline}
              </h1>
              <p className="ben-body" style={{ fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)" }}>
                {content.subheadline}
              </p>
              <div>
                <a href={tel} className="ben-btn">
                  <PhoneGlyph />
                  {content.cta.buttonLabel}
                </a>
              </div>
            </div>
            {hero ? (
              <div className="ben-tile ben-tile--photo ben-hero-photo" data-enter="2">
                <Photo image={hero} sizes="(min-width: 768px) 50vw, 100vw" preload />
              </div>
            ) : (
              <div
                className="ben-tile ben-tile--ink ben-hero-photo"
                data-enter="2"
                style={{ display: "grid", alignContent: "space-between", gap: 24 }}
              >
                <p className="ben-kicker ben-muted">What we do</p>
                <ul style={{ display: "grid", gap: 10 }}>
                  {content.services.map((s) => (
                    <li key={s.title} className="ben-h3" style={{ fontSize: "clamp(1.25rem, 1rem + 1vw, 1.75rem)" }}>
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <a href={tel} className="ben-tile ben-tile--accent ben-phone" data-enter="3">
              <span className="ben-kicker ben-muted">Call us</span>
              <strong>{site.phone}</strong>
            </a>
            <div
              className="ben-tile"
              data-enter="3"
              style={{ display: "grid", alignContent: "space-between", gap: 12 }}
            >
              <span className="ben-kicker">{site.hours.length ? "Today" : "Based in"}</span>
              {site.hours.length ? (
                <OpenStatus hours={site.hours} className="ben-open" dotClass="ben-open-dot" />
              ) : (
                <strong className="ben-h3">{site.city}</strong>
              )}
            </div>
            <div
              className="ben-tile"
              data-enter="4"
              style={{ display: "grid", alignContent: "space-between", gap: 12 }}
            >
              <span className="ben-kicker">Areas we cover</span>
              <span className="ben-count">{content.serviceAreas.length}</span>
            </div>
            <div
              className="ben-tile ben-tile--photo"
              data-enter="4"
              style={detail ? undefined : { padding: "clamp(20px, 2.4vw, 36px)", background: "var(--tile)" }}
            >
              {detail ? (
                <Photo image={detail} sizes="(min-width: 1100px) 25vw, 50vw" />
              ) : (
                <div style={{ display: "grid", gap: 12, alignContent: "space-between", height: "100%" }}>
                  <span className="ben-kicker">Find us</span>
                  <strong className="ben-h3">{site.city}</strong>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="services" aria-labelledby="ben-services-h" className="ben-wrap ben-section">
          <div className="ben-grid ben-services">
            <div className="ben-services-head" style={{ padding: "8px 4px 4px" }}>
              <h2 id="ben-services-h" className="ben-h2">
                What we do
              </h2>
            </div>
            {content.services.map((s, i) => (
              <article key={s.title} className="ben-tile ben-service" data-reveal>
                <span className="ben-service-num">{i + 1}</span>
                <div style={{ display: "grid", gap: 8 }}>
                  <h3 className="ben-h3">{s.title}</h3>
                  <p className="ben-body">{s.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" aria-labelledby="ben-about-h" className="ben-wrap ben-section">
          <div className="ben-tile ben-about" data-reveal>
            <div style={{ display: "grid", gap: 16, alignContent: "center" }}>
              <h2 id="ben-about-h" className="ben-h2">
                About {site.name}
              </h2>
              {lead && <p style={{ fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", lineHeight: 1.55 }}>{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="ben-body">
                  {p}
                </p>
              ))}
            </div>
            {about && (
              <div className="ben-about-photo">
                <Photo image={about} sizes="(min-width: 900px) 45vw, 100vw" />
              </div>
            )}
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="ben-work-h" className="ben-wrap ben-section">
            <h2 id="ben-work-h" className="ben-h2" style={{ marginBottom: 20, paddingInline: 4 }}>
              Recent work
            </h2>
            <ul className="ben-grid ben-work">
              {work.map((image) => (
                <li key={image.src} className="ben-tile ben-tile--photo" data-reveal>
                  <Photo image={image} sizes="(min-width: 900px) 25vw, 50vw" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="ben-how-h" className="ben-wrap ben-section">
          <h2 id="ben-how-h" className="ben-h2" style={{ marginBottom: 20, paddingInline: 4 }}>
            How it works
          </h2>
          <ol className="ben-grid ben-steps">
            {steps.map((step, i) => (
              <li key={step.title} className="ben-tile ben-step" data-reveal>
                <div className="ben-step-bar" aria-hidden="true">
                  <span style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
                </div>
                <span className="ben-step-num">Step {i + 1}</span>
                <h3 className="ben-h3">{step.title}</h3>
                <p className="ben-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="questions" aria-labelledby="ben-faq-h" className="ben-wrap ben-section">
          <div className="ben-grid ben-pair">
            <div className="ben-tile" data-reveal>
              <h2 className="ben-h3">Where we work</h2>
              <ul className="ben-chips">
                {content.serviceAreas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              {site.hours.length > 0 && (
                <>
                  <h2 className="ben-h3" style={{ marginTop: 32 }}>
                    Hours
                  </h2>
                  <ul className="ben-small ben-muted" style={{ marginTop: 8, display: "grid", gap: 2 }}>
                    {site.hours.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="ben-tile" data-reveal>
              <h2 id="ben-faq-h" className="ben-h3" style={{ marginBottom: 12 }}>
                Questions
              </h2>
              <Faq items={content.faq} className="ben-faq" answerClass="ben-body" />
            </div>
          </div>
        </section>

        <section aria-labelledby="ben-cta-h" className="ben-wrap ben-section">
          <div className="ben-tile ben-tile--accent ben-cta" data-reveal>
            <h2 id="ben-cta-h" className="ben-h2">
              {content.cta.heading}
            </h2>
            <p className="ben-body">{content.cta.body}</p>
            <a href={tel} className="ben-cta-phone">
              {site.phone}
            </a>
            <a href={tel} className="ben-btn">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="ben-footer">
        <div className="ben-wrap">
          <div className="ben-footer-grid ben-small">
            <div>
              <h2>{site.name}</h2>
              <p className="ben-muted">{site.city}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="ben-muted">{site.address ?? site.city}</address>
            </div>
            <div>
              <h2>Services</h2>
              <p className="ben-muted">{content.services.map((s) => s.title).join(" · ")}</p>
            </div>
          </div>
          <p className="ben-small ben-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="ben-callbar">
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
