import { DM_Sans, DM_Serif_Display } from "next/font/google";
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
import "./retro.css";

// Retro: sunburst stripes behind a round photo, a menu card for services,
// wavy edges between cream and brown sections.

const serif = DM_Serif_Display({ subsets: ["latin"], preload: false, weight: "400", variable: "--ret-serif" });
const sans = DM_Sans({ subsets: ["latin"], preload: false, variable: "--ret-sans" });

function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={flip ? "ret-wave ret-wave--flip" : "ret-wave"}
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M0 40V20C120 0 240 0 360 20s240 20 360 0 240-20 360 0 240 20 360 0v20Z" />
    </svg>
  );
}

export default function RetroTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const rounds = GALLERY_SLOTS.map((s) => images[s])
    .filter((i): i is SiteImage => !!i)
    .slice(0, 3);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl ret ${serif.variable} ${sans.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="ret-skip" />
      <header data-site-header className="ret-header">
        <div className="ret-wrap ret-header-inner">
          <a href="#top" className="ret-name">
            {site.name}
          </a>
          <a href={tel} className="ret-btn">
            <PhoneGlyph />
            Call
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="ret-h1" className="ret-wrap ret-hero">
          <div className="ret-hero-text">
            <p className="ret-small ret-muted" data-enter="1">
              {site.city}
            </p>
            <h1 id="ret-h1" className="ret-display" data-enter="1">
              {content.headline}
            </h1>
            <p
              className="ret-body ret-muted"
              data-enter="2"
              style={{ fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.3rem)" }}
            >
              {content.subheadline}
            </p>
            <a href={tel} className="ret-btn" data-enter="3">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
          <div className="ret-sun" data-enter="4">
            {hero ? (
              <div className="ret-sun-photo">
                <Photo image={hero} sizes="(min-width: 1024px) 360px, 64vw" preload />
              </div>
            ) : (
              <div className="ret-sun-initial" aria-hidden="true">
                {site.name.charAt(0)}
              </div>
            )}
          </div>
        </section>

        <Wave />
        <section id="services" aria-labelledby="ret-services-h" className="ret-section ret-brown">
          <div className="ret-wrap">
            <h2 id="ret-services-h" className="ret-h2">
              What we do
            </h2>
            <div className="ret-menu" data-reveal>
              <ul>
                {content.services.map((s) => (
                  <li key={s.title}>
                    <h3 className="ret-h3">{s.title}</h3>
                    <p className="ret-body ret-muted">{s.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <Wave flip />

        <section id="about" aria-labelledby="ret-about-h" className="ret-section">
          <div
            className="ret-wrap ret-about"
            style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)", maxWidth: "52rem" }}
          >
            {about && (
              <div className="ret-about-photo" data-reveal>
                <Photo image={about} sizes="(min-width: 900px) 440px, 100vw" />
              </div>
            )}
            <div style={{ display: "grid", gap: 20 }} data-reveal>
              <h2 id="ret-about-h" className="ret-h2">
                About {site.name}
              </h2>
              {lead && (
                <p className="ret-h3" style={{ lineHeight: 1.4 }}>
                  {lead}
                </p>
              )}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="ret-body ret-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {rounds.length > 0 && (
          <section id="work" aria-labelledby="ret-work-h" className="ret-section" style={{ paddingTop: 0 }}>
            <div className="ret-wrap">
              <h2 id="ret-work-h" className="ret-h2">
                A few favourites
              </h2>
              <ul className="ret-rounds">
                {rounds.map((image) => (
                  <li key={image.src} data-reveal>
                    <Photo image={image} sizes="(min-width: 900px) 30vw, 33vw" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="ret-how-h" className="ret-section" style={{ paddingTop: 0 }}>
          <div className="ret-wrap">
            <h2 id="ret-how-h" className="ret-h2">
              How it works
            </h2>
            <ol className="ret-steps">
              {steps.map((step, i) => (
                <li key={step.title} data-reveal>
                  <span className="ret-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="ret-h3">{step.title}</h3>
                  <p className="ret-body ret-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="ret-areas-h" className="ret-section" style={{ paddingTop: 0 }}>
          <div className="ret-wrap">
            <h2 id="ret-areas-h" className="ret-h2">
              Where we are
            </h2>
            <ul className="ret-pills" data-reveal>
              {content.serviceAreas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" aria-labelledby="ret-faq-h" className="ret-section" style={{ paddingTop: 0 }}>
          <div className="ret-wrap">
            <h2 id="ret-faq-h" className="ret-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="ret-faq" answerClass="ret-body ret-muted" />
          </div>
        </section>

        <section aria-labelledby="ret-cta-h" className="ret-section" style={{ paddingTop: 0 }}>
          <div className="ret-wrap">
            <div className="ret-cta" data-reveal>
              <h2 id="ret-cta-h" className="ret-h2">
                {content.cta.heading}
              </h2>
              <p className="ret-body ret-muted">{content.cta.body}</p>
              <a href={tel} className="ret-cta-phone">
                {site.phone}
              </a>
              <a href={tel} className="ret-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ret-footer">
        <div className="ret-wrap">
          <div className="ret-footer-grid ret-body">
            <div>
              <h2>{site.name}</h2>
              <p className="ret-muted">{site.city}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="ret-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul className="ret-muted" style={{ fontSize: "0.875rem" }}>
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="ret-small ret-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="ret-callbar">
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
