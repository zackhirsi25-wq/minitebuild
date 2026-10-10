import { Figtree, Young_Serif } from "next/font/google";
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
import "./haven.css";

// Haven: "Open door". Arched photo frames like doorways, and a live "Open now"
// status worked out from the business's own hours.

const serif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--hav-serif" });
const sans = Figtree({ subsets: ["latin"], variable: "--hav-sans" });

export default function HavenTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const detail = images.detail ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);
  const mapsUrl = site.address
    ? `https://maps.google.com/?q=${encodeURIComponent(`${site.name} ${site.address}`)}`
    : null;

  return (
    <div data-site className={`tpl hav ${serif.variable} ${sans.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="hav-skip" />
      <header data-site-header className="hav-header">
        <div className="hav-wrap hav-header-inner">
          <a href="#top" className="hav-name">
            {site.name}
          </a>
          <OpenStatus hours={site.hours} className="hav-open" dotClass="hav-open-dot" />
          <a href={tel} className="hav-btn hav-btn--small">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="hav-h1" className="hav-wrap hav-hero">
          <div className="hav-hero-text">
            <h1 id="hav-h1" className="hav-display" data-enter="1">
              {content.headline}
            </h1>
            <p className="hav-lead hav-muted" data-enter="2" style={{ maxWidth: "38ch" }}>
              {content.subheadline}
            </p>
            <div data-enter="3" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <a href={tel} className="hav-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
              <OpenStatus hours={site.hours} className="hav-open" dotClass="hav-open-dot" />
            </div>
          </div>
          <div className={hero ? "hav-arch" : "hav-arch hav-door"} data-enter="4" aria-hidden={hero ? undefined : true}>
            {hero ? <Photo image={hero} sizes="(min-width: 1024px) 520px, 100vw" preload /> : site.name.charAt(0)}
          </div>
        </section>

        <section id="services" aria-labelledby="hav-services-h" className="hav-section hav-blush">
          <div className="hav-wrap hav-services">
            <div style={{ display: "grid", gap: 24, alignContent: "start" }}>
              <h2 id="hav-services-h" className="hav-h2">
                What we offer
              </h2>
              {detail && (
                <div className="hav-arch hav-detail" data-reveal>
                  <Photo image={detail} sizes="320px" />
                </div>
              )}
            </div>
            <ul className="hav-services-list">
              {content.services.map((s) => (
                <li key={s.title} data-reveal>
                  <h3 className="hav-h3">{s.title}</h3>
                  <p className="hav-body hav-muted">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" aria-labelledby="hav-about-h" className="hav-section">
          <div
            className="hav-wrap hav-about"
            style={about ? undefined : { gridTemplateColumns: "minmax(0, 1fr)", maxWidth: "52rem" }}
          >
            <div
              className="hav-about-text"
              data-reveal
              style={about ? undefined : { margin: 0, boxShadow: "none", padding: 0 }}
            >
              <h2 id="hav-about-h" className="hav-h2">
                About {site.name}
              </h2>
              {lead && <p className="hav-lead">{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="hav-body hav-muted">
                  {p}
                </p>
              ))}
            </div>
            {about && (
              <div className="hav-arch" data-reveal style={{ justifySelf: "center" }}>
                <Photo image={about} sizes="(min-width: 1024px) 440px, 100vw" />
              </div>
            )}
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="hav-work-h" className="hav-section" style={{ paddingTop: 0 }}>
            <div className="hav-wrap">
              <h2 id="hav-work-h" className="hav-h2">
                A look inside
              </h2>
              <div className="hav-arches">
                {work.slice(0, 4).map((image) => (
                  <div key={image.src} className="hav-arch" data-reveal>
                    <Photo image={image} sizes="(min-width: 900px) 25vw, 50vw" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="hav-how-h" className="hav-section hav-sage">
          <div className="hav-wrap">
            <h2 id="hav-how-h" className="hav-h2">
              How it works
            </h2>
            <ol className="hav-path">
              {steps.map((step, i) => (
                <li key={step.title} data-reveal>
                  <span className="hav-path-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="hav-h3">{step.title}</h3>
                  <p className="hav-body hav-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="hav-visit-h" className="hav-section">
          <div className="hav-wrap hav-visit">
            <div data-reveal>
              <h2 id="hav-visit-h" className="hav-h2">
                Where we are
              </h2>
              <ul className="hav-areas hav-small">
                {content.serviceAreas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            {site.hours.length > 0 && (
              <div data-reveal>
                <h2 className="hav-h2">Opening hours</h2>
                <div className="hav-hours hav-small">
                  {site.hours.map((line) => {
                    const [day, ...time] = line.split(": ");
                    return (
                      <div key={line}>
                        <span>{day}</span>
                        <span className="hav-muted">{time.join(": ")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="questions" aria-labelledby="hav-faq-h" className="hav-section hav-blush">
          <div className="hav-wrap">
            <h2 id="hav-faq-h" className="hav-h2" style={{ textAlign: "center" }}>
              Questions
            </h2>
            <Faq items={content.faq} className="hav-faq" answerClass="hav-body hav-muted" />
          </div>
        </section>

        <section aria-labelledby="hav-cta-h" className="hav-section">
          <div className="hav-wrap">
            <div className="hav-cta" data-reveal>
              <h2 id="hav-cta-h" className="hav-h2">
                {content.cta.heading}
              </h2>
              <p className="hav-lead hav-muted">{content.cta.body}</p>
              <a href={tel} className="hav-cta-phone">
                {site.phone}
              </a>
              <a href={tel} className="hav-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="hav-footer">
        <div className="hav-wrap">
          <div className="hav-footer-grid hav-small">
            <div>
              <h2>{site.name}</h2>
              <p className="hav-muted">{content.services.map((s) => s.title).join(" · ")}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="hav-muted">{site.address ?? site.city}</address>
              {mapsUrl && (
                <a href={mapsUrl} className="hav-muted">
                  Get directions
                </a>
              )}
            </div>
          </div>
          <p className="hav-small hav-muted" style={{ marginTop: 32 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="hav-callbar">
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
