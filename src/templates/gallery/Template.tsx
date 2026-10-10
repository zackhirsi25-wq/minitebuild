import { Geist } from "next/font/google";
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
import "./gallery.css";

// Gallery: "White wall". The headline is the exhibit; photos hang like framed
// prints with wall labels.

const font = Geist({ subsets: ["latin"], variable: "--gal-font" });

function Label({ image, city }: { image: SiteImage; city: string }) {
  return (
    <p className="gal-label gal-small">
      <strong>{city}</strong>
      <span>{image.alt}</span>
    </p>
  );
}

export default function GalleryTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl gal ${font.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="gal-skip" />
      <header data-site-header className="gal-header">
        <div className="gal-wrap gal-header-inner">
          <a href="#top" className="gal-name">
            {site.name}
          </a>
          <nav aria-label="Sections" className="gal-nav">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#questions">Questions</a>
          </nav>
          <a href={tel} className="gal-btn gal-btn--small">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="gal-h1" className="gal-wrap gal-grid gal-hero">
          <h1 id="gal-h1" className="gal-display" data-enter="1" style={{ gridColumn: "1 / -1" }}>
            {content.headline}
          </h1>
          <div className="gal-hero-foot">
            <p className="gal-lead" data-enter="2">
              {content.subheadline}
            </p>
            <div data-enter="3" style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "center" }}>
              <a href={tel} className="gal-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
              <a href={tel} className="gal-link">
                {site.phone}
              </a>
            </div>
          </div>
        </section>

        <div className="gal-wrap gal-grid gal-print">
          {hero ? (
            <>
              <div className="gal-frame" data-reveal>
                <Photo image={hero} sizes="(min-width: 1024px) 84vw, 100vw" preload />
              </div>
              <Label image={hero} city={site.city} />
            </>
          ) : (
            <div className="gal-placard" data-reveal>
              <p className="gal-small" style={{ color: "var(--stone)" }}>
                {site.name}, {site.city}
              </p>
              <ol>
                {content.services.map((s) => (
                  <li key={s.title}>{s.title}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <section id="services" aria-labelledby="gal-services-h" className="gal-section" style={{ paddingTop: 0 }}>
          <div className="gal-wrap gal-grid">
            <h2 id="gal-services-h" className="gal-h2 gal-services-head">
              What we do
            </h2>
            <ul className="gal-rows">
              {content.services.map((s) => (
                <li key={s.title} className="gal-row" data-reveal>
                  <h3>{s.title}</h3>
                  <p className="gal-body">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" aria-labelledby="gal-about-h" className="gal-section">
          <div className={about ? "gal-about" : "gal-wrap"}>
            <div
              className="gal-about-text"
              data-reveal
              style={about ? undefined : { paddingInline: 0, maxWidth: "52rem" }}
            >
              <h2 id="gal-about-h" className="gal-h2">
                About
              </h2>
              {lead && <p className="gal-lead">{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="gal-body">
                  {p}
                </p>
              ))}
            </div>
            {about && (
              <div className="gal-about-photo" data-reveal>
                <Photo image={about} sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            )}
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" aria-labelledby="gal-work-h" className="gal-section">
            <div className="gal-wrap">
              <h2 id="gal-work-h" className="gal-h2">
                Recent work
              </h2>
              <ul className="gal-hang">
                {work.map((image) => (
                  <li key={image.src} data-reveal>
                    <div className="gal-frame">
                      <Photo image={image} sizes="(min-width: 1024px) 30vw, 50vw" />
                    </div>
                    <Label image={image} city={site.city} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="gal-how-h" className="gal-section gal-how">
          <div className="gal-wrap">
            <h2 id="gal-how-h" className="gal-h2">
              How it works
            </h2>
            <ol className="gal-steps">
              {steps.map((step, i) => (
                <li key={step.title} className="gal-step" data-reveal>
                  <h3>
                    <span>{i + 1}. </span>
                    {step.title}
                  </h3>
                  <p className="gal-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="gal-areas-h" className="gal-section">
          <div className="gal-wrap">
            <h2 id="gal-areas-h" className="gal-h2">
              Where we work
            </h2>
            <p className="gal-areas" data-reveal>
              {content.serviceAreas.map((a, i) => (
                <span key={a}>
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {a}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section id="questions" aria-labelledby="gal-faq-h" className="gal-section" style={{ paddingTop: 0 }}>
          <div className="gal-wrap gal-faq">
            <h2 id="gal-faq-h" className="gal-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="gal-faq-list" />
          </div>
        </section>

        <section aria-labelledby="gal-cta-h" className="gal-section gal-cta">
          <div className="gal-wrap gal-cta-inner" data-reveal>
            <h2 id="gal-cta-h" className="gal-h2">
              {content.cta.heading}
            </h2>
            <p className="gal-lead">{content.cta.body}</p>
            <a href={tel} className="gal-cta-phone">
              {site.phone}
            </a>
            <a href={tel} className="gal-btn">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="gal-footer">
        <div className="gal-wrap">
          <div className="gal-colophon">
            <div>
              <h2>{site.name}</h2>
              <p>{site.city}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            {site.address && (
              <div>
                <h2>Visit</h2>
                <address>{site.address}</address>
              </div>
            )}
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul>
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="gal-fine gal-small">
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="gal-callbar">
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
