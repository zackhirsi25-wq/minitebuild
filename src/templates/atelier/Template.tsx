import { Bodoni_Moda, Jost } from "next/font/google";
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
import "./atelier.css";

// Atelier: a fashion house's restraint. Hairline Bodoni set centred, black on
// ivory, and the about portrait dropping below its own section.

const serif = Bodoni_Moda({
  subsets: ["latin"],
  preload: false,
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--ate-serif",
});
const sans = Jost({ subsets: ["latin"], preload: false, variable: "--ate-sans" });
const NUMERALS = ["I", "II", "III"];

export default function AtelierTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const about = images.about ?? null;
  const looks = GALLERY_SLOTS.map((s) => images[s])
    .filter((i): i is SiteImage => !!i)
    .slice(0, 3);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl ate ${serif.variable} ${sans.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="ate-skip" />
      <header data-site-header className="ate-header">
        <div className="ate-wrap ate-header-inner">
          <nav aria-label="Sections" className="ate-small">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#questions">Questions</a>
          </nav>
          <a href="#top" className="ate-name">
            {site.name}
          </a>
          <a href={tel} className="ate-header-call ate-small">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="ate-h1" className="ate-wrap ate-center ate-hero">
          <p className="ate-small ate-grey" data-enter="1">
            {site.city}
          </p>
          <h1 id="ate-h1" className="ate-display" data-enter="1">
            {content.headline}
          </h1>
          <p className="ate-lead ate-grey" data-enter="2" style={{ maxWidth: "40ch" }}>
            {content.subheadline}
          </p>
          <a href={tel} className="ate-btn" data-enter="3">
            <PhoneGlyph />
            {content.cta.buttonLabel}
          </a>
          {hero ? (
            <div className="ate-portrait" data-enter="4">
              <Photo image={hero} sizes="440px" preload />
            </div>
          ) : (
            <div className="ate-monogram" aria-hidden="true" data-enter="4">
              {site.name.charAt(0)}
            </div>
          )}
        </section>

        <section id="services" aria-labelledby="ate-services-h" className="ate-section" style={{ paddingTop: 0 }}>
          <div className="ate-wrap ate-center">
            <h2 id="ate-services-h" className="ate-h2">
              Services
            </h2>
            <hr className="ate-rule" />
            <ul className="ate-services">
              {content.services.map((s) => (
                <li key={s.title} data-reveal>
                  <h3 className="ate-serif">{s.title}</h3>
                  <p className="ate-body">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="ate-about-h"
          className="ate-section ate-cta"
          style={{ background: "var(--white)" }}
        >
          <div
            className="ate-wrap ate-about"
            style={about ? undefined : { justifyItems: "center", textAlign: "center" }}
          >
            {about && (
              <div className="ate-about-photo" data-reveal>
                <Photo image={about} sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            )}
            <div className="ate-about-text" data-reveal>
              <h2 id="ate-about-h" className="ate-h2">
                The house
              </h2>
              {lead && <p className="ate-lead">{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="ate-body">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {looks.length > 0 && (
          <section id="work" aria-labelledby="ate-work-h" className="ate-section">
            <div className="ate-wrap ate-center">
              <h2 id="ate-work-h" className="ate-h2">
                Lookbook
              </h2>
              <ul className="ate-looks" style={{ width: "100%" }}>
                {looks.map((image) => (
                  <li key={image.src} data-reveal>
                    <Photo image={image} sizes="(min-width: 768px) 30vw, 100vw" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="ate-how-h" className="ate-section">
          <div className="ate-wrap ate-center">
            <h2 id="ate-how-h" className="ate-h2">
              How it works
            </h2>
            <ol className="ate-steps" style={{ width: "100%" }}>
              {steps.map((step, i) => (
                <li key={step.title} data-reveal>
                  <span className="ate-numeral" aria-hidden="true">
                    {NUMERALS[i] ?? i + 1}
                  </span>
                  <h3 className="ate-serif">{step.title}</h3>
                  <p className="ate-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="ate-areas-h" className="ate-section" style={{ paddingTop: 0 }}>
          <div className="ate-wrap ate-center">
            <h2 id="ate-areas-h" className="ate-small ate-grey">
              Where we work
            </h2>
            <p className="ate-areas ate-lead" data-reveal>
              {content.serviceAreas.map((a, i) => (
                <span key={a}>
                  {i > 0 && <span aria-hidden="true">·</span>}
                  {a}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section id="questions" aria-labelledby="ate-faq-h" className="ate-section" style={{ paddingTop: 0 }}>
          <div className="ate-wrap ate-center">
            <h2 id="ate-faq-h" className="ate-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="ate-faq" answerClass="ate-body" />
          </div>
        </section>

        <section aria-labelledby="ate-cta-h" className="ate-section ate-cta">
          <div className="ate-wrap ate-center" data-reveal>
            <h2 id="ate-cta-h" className="ate-h2">
              {content.cta.heading}
            </h2>
            <a href={tel} className="ate-cta-phone">
              {site.phone}
            </a>
            <a href={tel} className="ate-btn">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="ate-footer">
        <div className="ate-wrap ate-center" style={{ gap: 16 }}>
          <p className="ate-name">{site.name}</p>
          <p className="ate-small ate-grey">
            {site.address ?? site.city} · <a href={tel}>{site.phone}</a>
          </p>
          {site.hours.length > 0 && <p className="ate-small ate-grey">{site.hours.join(" · ")}</p>}
          <p className="ate-small ate-grey">
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="ate-callbar">
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
