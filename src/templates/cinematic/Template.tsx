import { Fraunces, Manrope } from "next/font/google";
import { GALLERY_SLOTS } from "@/lib/content/schema";
import { telHref } from "@/lib/content/phone";
import type { SiteImage } from "@/lib/images/stock";
import { paragraphs, processSteps } from "../_kit/content";
import { SiteMotion } from "../_kit/motion";
import { paletteStyle } from "../_kit/palette";
import { Photo } from "../_kit/photo";
import type { TemplateProps } from "../_kit/types";
import "../_kit/kit.css";
import "../_kit/base.css";
import "./tokens.css";
import "./cinematic.css";

// Cinematic: "Night shoot". See meta.ts for slots and palettes.

const display = Fraunces({ subsets: ["latin"], axes: ["SOFT", "opsz"], variable: "--cin-font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--cin-font-body" });

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

export default function CinematicTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const feature = images.feature ?? null;
  const work = GALLERY_SLOTS.map((slot) => images[slot]).filter((img): img is SiteImage => !!img);
  const steps = processSteps(content, site.phone);
  const [aboutLead, ...aboutRest] = paragraphs(content.about);
  const year = new Date().getFullYear();

  return (
    <div data-site className={`tpl cin ${display.variable} ${body.variable}`} style={paletteStyle(palette)}>
      <span data-scroll-sentinel aria-hidden="true" className="cin-sentinel" />
      <a href="#main" className="cin-skip">
        Skip to content
      </a>

      <header data-site-header className="cin-header">
        <div className="cin-wrap cin-header-inner">
          <a href="#top" className="cin-wordmark">
            {site.name}
          </a>
          <nav aria-label="Sections" className="cin-nav">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            {work.length > 0 && <a href="#work">Work</a>}
            <a href="#questions">Questions</a>
          </nav>
          <a href={tel} className="cin-header-phone">
            {site.phone}
          </a>
          <a href={tel} className="cin-btn cin-btn--small cin-header-call">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" className={hero ? "cin-hero" : "cin-hero cin-hero--type"} aria-labelledby="cin-h1">
          {hero && (
            <>
              <div className="cin-hero-frame">
                <Photo image={hero} sizes="100vw" preload className="cin-grade cin-hero-img" />
              </div>
              <div className="cin-hero-shade" aria-hidden="true" />
            </>
          )}
          <div className="cin-wrap cin-hero-body">
            <h1 id="cin-h1" className="cin-display" data-enter="1">
              {content.headline}
            </h1>
            <p className="cin-lead" data-enter="2">
              {content.subheadline}
            </p>
            <div className="cin-hero-actions" data-enter="3">
              <a href={tel} className="cin-btn">
                <PhoneGlyph />
                {content.cta.buttonLabel}
              </a>
              <a href="#services" className="cin-link">
                See services <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="cin-wrap" data-enter="4">
            <div className="cin-hero-meta cin-small">
              <span>{site.city}</span>
              {site.address && <span className="cin-hero-meta-address">{site.address}</span>}
              <a href={tel} className="cin-hero-meta-phone">
                {site.phone}
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="cin-section" aria-labelledby="cin-services-h">
          <div className="cin-wrap cin-grid">
            <div className="cin-services-head">
              <h2 id="cin-services-h" className="cin-h2">
                What we do
              </h2>
              <p className="cin-body cin-muted">
                Serving {site.city} and nearby. Call {site.phone} to talk through your job.
              </p>
            </div>
            <ol className="cin-services-list">
              {content.services.map((service, i) => (
                <li key={service.title} className="cin-service" data-reveal>
                  <span className="cin-small cin-service-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="cin-title">{service.title}</h3>
                  <p className="cin-body">{service.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="cin-about-section" aria-labelledby="cin-about-h">
          {about && (
            <div className="cin-about-media">
              <Photo image={about} sizes="100vw" className="cin-grade" />
            </div>
          )}
          <div className="cin-about-body">
            <div className="cin-wrap cin-grid">
              <div className={about ? "cin-about-panel" : "cin-about-panel is-plain"} data-reveal>
                <h2 id="cin-about-h" className="cin-h2">
                  About us
                </h2>
                {aboutLead && <p className="cin-lead">{aboutLead}</p>}
                {aboutRest.map((p) => (
                  <p key={p.slice(0, 40)} className="cin-body">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cin-section cin-how is-light" aria-labelledby="cin-how-h">
          <div className="cin-wrap cin-grid">
            <h2 id="cin-how-h" className="cin-h2">
              How it works
            </h2>
            <ol className="cin-steps">
              {steps.map((step, i) => (
                <li key={step.title} className="cin-step" data-reveal>
                  <span className="cin-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="cin-title">{step.title}</h3>
                  <p className="cin-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {work.length > 0 && (
          <section id="work" className="cin-section" aria-labelledby="cin-work-h">
            <div className="cin-wrap cin-grid">
              <h2 id="cin-work-h" className="cin-h2 cin-work-head">
                Recent work
              </h2>
              <ul className="cin-work-grid" data-count={work.length}>
                {work.map((image) => (
                  <li key={image.src} className="cin-work-item" data-reveal>
                    <Photo image={image} sizes="(min-width: 768px) 58vw, 100vw" className="cin-grade" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="cin-section cin-areas is-graphite" aria-labelledby="cin-areas-h">
          <div className="cin-wrap">
            <h2 id="cin-areas-h" className="cin-h2">
              Where we work
            </h2>
            <ul className="cin-credits" data-reveal>
              {content.serviceAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" className="cin-section is-light" aria-labelledby="cin-faq-h">
          <div className="cin-wrap cin-grid">
            <h2 id="cin-faq-h" className="cin-h2 cin-faq-head">
              Questions
            </h2>
            <div className="cin-faq-list">
              {content.faq.map((item) => (
                <details key={item.question}>
                  <summary>
                    <h3 className="cin-title">{item.question}</h3>
                    <span className="cin-plus" aria-hidden="true" />
                  </summary>
                  <p className="cin-body">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={feature ? "cin-cta" : "cin-cta cin-cta--type"} aria-labelledby="cin-cta-h">
          {feature && (
            <div className="cin-cta-media">
              <Photo image={feature} sizes="100vw" className="cin-grade" />
            </div>
          )}
          <div className="cin-wrap cin-cta-body" data-reveal>
            <h2 id="cin-cta-h" className="cin-h2">
              {content.cta.heading}
            </h2>
            <p className="cin-lead">{content.cta.body}</p>
            <a href={tel} className="cin-cta-phone">
              {site.phone}
            </a>
            <a href={tel} className="cin-btn">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="cin-footer">
        <div className="cin-wrap">
          <p className="cin-h2">{site.name}</p>
          <dl className="cin-roll">
            <div>
              <dt>Call</dt>
              <dd>
                <a href={tel}>{site.phone}</a>
              </dd>
            </div>
            {site.address && (
              <div>
                <dt>Visit</dt>
                <dd>
                  <address style={{ fontStyle: "normal" }}>{site.address}</address>
                </dd>
              </div>
            )}
            {site.hours.length > 0 && (
              <div>
                <dt>Hours</dt>
                <dd className="cin-hours">
                  {site.hours.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </dd>
              </div>
            )}
            <div>
              <dt>Services</dt>
              <dd>{content.services.map((s) => s.title).join(" · ")}</dd>
            </div>
            <div>
              <dt>Serving</dt>
              <dd>{content.serviceAreas.join(" · ")}</dd>
            </div>
          </dl>
          <p className="cin-small cin-fineprint">
            © {year} {site.name}
          </p>
        </div>
      </footer>

      <div className="call-bar cin-callbar">
        <a href={tel} aria-label={`Call ${site.name} at ${site.phone}`}>
          <span>{site.phone}</span>
          <strong>
            <PhoneGlyph />
            Call now
          </strong>
        </a>
      </div>

      <SiteMotion />
    </div>
  );
}
