import { Lora, Nunito_Sans } from "next/font/google";
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
import "./botanical.css";

// Botanical: leaf-shaped frames (two opposite rounded corners), a vine
// running down "How it works", deep green and oat in turn.

const serif = Lora({ subsets: ["latin"], style: ["normal", "italic"], variable: "--bot-serif" });
const sans = Nunito_Sans({ subsets: ["latin"], variable: "--bot-sans" });

function Leaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15Z" />
      <path d="M5 19 13 11" />
    </svg>
  );
}

export default function BotanicalTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const detail = images.detail ?? null;
  const about = images.about ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s])
    .filter((i): i is SiteImage => !!i)
    .slice(0, 3);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl bot ${serif.variable} ${sans.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="bot-skip" />
      <header data-site-header className="bot-header">
        <div className="bot-wrap bot-header-inner">
          <a href="#top" className="bot-name">
            <Leaf />
            {site.name}
          </a>
          <a href={tel} className="bot-btn">
            <PhoneGlyph />
            Call
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="bot-h1" className="bot-wrap bot-hero">
          <div className="bot-hero-text">
            <p className="bot-small bot-muted" data-enter="1">
              {site.city}
            </p>
            <h1 id="bot-h1" className="bot-display" data-enter="1">
              {content.headline}
            </h1>
            <p
              className="bot-body bot-muted"
              data-enter="2"
              style={{ fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.3rem)" }}
            >
              {content.subheadline}
            </p>
            <a href={tel} className="bot-btn" data-enter="3">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
          <div className="bot-leaves" data-enter="4">
            <div className={hero ? "bot-leaf" : "bot-leaf bot-leaf--empty"}>
              {hero && <Photo image={hero} sizes="(min-width: 1024px) 520px, 100vw" preload />}
            </div>
            <div className={detail ? "bot-leaf bot-leaf--small" : "bot-leaf bot-leaf--small bot-leaf--empty"}>
              {detail && <Photo image={detail} sizes="220px" />}
            </div>
          </div>
        </section>

        <section id="services" aria-labelledby="bot-services-h" className="bot-section bot-green">
          <div className="bot-wrap">
            <h2 id="bot-services-h" className="bot-h2">
              What we do
            </h2>
            <ul className="bot-services">
              {content.services.map((s) => (
                <li key={s.title} data-reveal>
                  <Leaf />
                  <h3 className="bot-h3">{s.title}</h3>
                  <p className="bot-body bot-muted">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" aria-labelledby="bot-about-h" className="bot-section">
          <div
            className="bot-wrap bot-about"
            style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)", maxWidth: "52rem" }}
          >
            {about && (
              <div className="bot-leaf" data-reveal>
                <Photo image={about} sizes="(min-width: 900px) 420px, 100vw" />
              </div>
            )}
            <div style={{ display: "grid", gap: 20 }} data-reveal>
              <h2 id="bot-about-h" className="bot-h2">
                About {site.name}
              </h2>
              {lead && (
                <p className="bot-h3" style={{ lineHeight: 1.45 }}>
                  {lead}
                </p>
              )}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="bot-body bot-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="bot-work-h" className="bot-section" style={{ paddingTop: 0 }}>
            <div className="bot-wrap">
              <h2 id="bot-work-h" className="bot-h2">
                Recent work
              </h2>
              <ul className="bot-work">
                {work.map((image) => (
                  <li key={image.src} data-reveal>
                    <div className="bot-leaf">
                      <Photo image={image} sizes="33vw" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="bot-how-h" className="bot-section" style={{ paddingTop: 0 }}>
          <div className="bot-wrap">
            <h2 id="bot-how-h" className="bot-h2">
              How it works
            </h2>
            <ol className="bot-vine">
              {steps.map((step) => (
                <li key={step.title} data-reveal>
                  <h3 className="bot-h3">{step.title}</h3>
                  <p className="bot-body bot-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="bot-areas-h" className="bot-section" style={{ paddingTop: 0 }}>
          <div className="bot-wrap">
            <h2 id="bot-areas-h" className="bot-h2">
              Where we are
            </h2>
            <p className="bot-areas" data-reveal>
              {content.serviceAreas.map((a, i) => (
                <span key={a}>
                  {i > 0 && <span aria-hidden="true">·</span>}
                  {a}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section id="questions" aria-labelledby="bot-faq-h" className="bot-section" style={{ paddingTop: 0 }}>
          <div className="bot-wrap">
            <h2 id="bot-faq-h" className="bot-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="bot-faq" answerClass="bot-body bot-muted" />
          </div>
        </section>

        <section aria-labelledby="bot-cta-h" className="bot-section" style={{ paddingTop: 0 }}>
          <div className="bot-wrap">
            <div className="bot-cta bot-green" data-reveal>
              <h2 id="bot-cta-h" className="bot-h2">
                {content.cta.heading}
              </h2>
              <p className="bot-body bot-muted">{content.cta.body}</p>
              <a href={tel} className="bot-cta-phone">
                {site.phone}
              </a>
              <a href={tel} className="bot-btn" style={{ background: "var(--oat)", color: "var(--green)" }}>
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bot-footer">
        <div className="bot-wrap">
          <div className="bot-footer-grid bot-small">
            <div>
              <h2>{site.name}</h2>
              <p className="bot-muted">{content.services.map((s) => s.title).join(" · ")}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="bot-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul className="bot-muted">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="bot-small bot-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="bot-callbar">
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
