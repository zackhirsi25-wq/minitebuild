import { Bricolage_Grotesque, Source_Serif_4 } from "next/font/google";
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
import "./story.css";

// Story: "Chapters". On desktop the photo stays pinned while the three
// chapters scroll past; each chapter swaps the scene (CSS scroll-driven
// animations, first scene only where unsupported or with reduced motion).

const display = Bricolage_Grotesque({ subsets: ["latin"], preload: false, axes: ["opsz"], variable: "--sto-display" });
const serif = Source_Serif_4({ subsets: ["latin"], preload: false, variable: "--sto-serif" });

function Scene({ image, n }: { image: SiteImage | null; n: number }) {
  return (
    <div className="sto-scene">
      {image ? (
        <Photo image={image} sizes="(min-width: 1024px) 52vw, 1px" />
      ) : (
        <div className="sto-scene-empty" aria-hidden="true">
          {n}
        </div>
      )}
    </div>
  );
}

function InlinePhoto({ image }: { image: SiteImage | null }) {
  if (!image) return null;
  return (
    <div className="sto-inline-photo">
      <Photo image={image} sizes="(min-width: 1024px) 1px, 100vw" />
    </div>
  );
}

export default function StoryTemplate({ site, images, palette }: TemplateProps) {
  const { content } = site;
  const tel = telHref(site.phone);
  const hero = images.hero ?? null;
  const scenes = [images.feature ?? null, images.about ?? null, images.detail ?? null];
  const work = GALLERY_SLOTS.map((s) => images[s]).filter((i): i is SiteImage => !!i);
  const steps = processSteps(content, site.phone);
  const [lead, ...rest] = paragraphs(content.about);

  return (
    <div data-site className={`tpl sto ${display.variable} ${serif.variable}`} style={paletteStyle(palette)}>
      <SiteStart skipClass="sto-skip" />
      <header data-site-header className="sto-header">
        <div className="sto-wrap sto-header-inner">
          <a href="#top" className="sto-name">
            {site.name}
          </a>
          <a href={tel} className="sto-btn sto-btn--small">
            Call now
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" aria-labelledby="sto-h1" className={`sto-wrap sto-hero${hero ? "" : " sto-hero--type"}`}>
          <div className="sto-hero-text">
            <h1 id="sto-h1" className="sto-display" data-enter="1" style={hero ? undefined : { maxWidth: "14ch" }}>
              {content.headline}
            </h1>
            {!hero && <span className="sto-underline" aria-hidden="true" data-enter="2" />}
            <p className="sto-lead sto-muted" data-enter="2" style={{ maxWidth: "36ch" }}>
              {content.subheadline}
            </p>
            <a href={tel} className="sto-btn" data-enter="3">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
          {hero && (
            <div className="sto-hero-photo" data-enter="4">
              <Photo image={hero} sizes="(min-width: 1024px) 46vw, 100vw" preload />
            </div>
          )}
        </section>

        <div className="sto-wrap sto-chapters">
          <div className="sto-chapter-list">
            <article id="services" aria-labelledby="sto-c1" className="sto-chapter">
              <p className="sto-chapter-mark">Chapter 1</p>
              <h2 id="sto-c1" className="sto-h2">
                What we do
              </h2>
              <InlinePhoto image={scenes[0]} />
              <ul className="sto-services">
                {content.services.map((s) => (
                  <li key={s.title}>
                    <h3 className="sto-h3">{s.title}</h3>
                    <p className="sto-body sto-muted">{s.description}</p>
                  </li>
                ))}
              </ul>
            </article>
            <article id="about" aria-labelledby="sto-c2" className="sto-chapter">
              <p className="sto-chapter-mark">Chapter 2</p>
              <h2 id="sto-c2" className="sto-h2">
                About {site.name}
              </h2>
              <InlinePhoto image={scenes[1]} />
              {lead && <p className="sto-lead">{lead}</p>}
              {rest.map((p) => (
                <p key={p.slice(0, 32)} className="sto-body sto-muted">
                  {p}
                </p>
              ))}
            </article>
            <article aria-labelledby="sto-c3" className="sto-chapter">
              <p className="sto-chapter-mark">Chapter 3</p>
              <h2 id="sto-c3" className="sto-h2">
                How it works
              </h2>
              <InlinePhoto image={scenes[2]} />
              <ol className="sto-steps">
                {steps.map((step) => (
                  <li key={step.title}>
                    <h3 className="sto-h3">{step.title}</h3>
                    <p className="sto-body sto-muted">{step.body}</p>
                  </li>
                ))}
              </ol>
            </article>
          </div>
          <div className="sto-stage" aria-hidden="true">
            {scenes.map((image, i) => (
              <Scene key={i} image={image} n={i + 1} />
            ))}
            <ol className="sto-rail">
              {scenes.map((_, i) => (
                <li key={i}>
                  <span />
                </li>
              ))}
            </ol>
          </div>
        </div>

        {work.length > 0 && (
          <section id="work" aria-labelledby="sto-work-h" className="sto-section">
            <div className="sto-wrap">
              <h2 id="sto-work-h" className="sto-h2">
                Recent work
              </h2>
              <ul className="sto-work">
                {work.map((image) => (
                  <li key={image.src} data-reveal>
                    <Photo image={image} sizes="(min-width: 768px) 45vw, 50vw" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section aria-labelledby="sto-areas-h" className="sto-section sto-sand">
          <div className="sto-wrap">
            <h2 id="sto-areas-h" className="sto-small sto-muted">
              Where we work
            </h2>
            <p className="sto-areas" data-reveal>
              {content.serviceAreas.map((a, i) => (
                <span key={a}>
                  {i > 0 && <span aria-hidden="true">·</span>}
                  {a}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section id="questions" aria-labelledby="sto-faq-h" className="sto-section">
          <div className="sto-wrap">
            <h2 id="sto-faq-h" className="sto-h2">
              Questions
            </h2>
            <Faq items={content.faq} className="sto-faq" answerClass="sto-body" />
          </div>
        </section>

        <section aria-labelledby="sto-cta-h" className={hero ? "sto-cta" : "sto-cta sto-cta--type"}>
          {hero && (
            <div className="sto-cta-media">
              <Photo image={hero} sizes="100vw" />
            </div>
          )}
          <div className="sto-wrap sto-cta-inner" data-reveal>
            <p className="sto-chapter-mark">The next chapter</p>
            <h2 id="sto-cta-h" className="sto-h2">
              {content.cta.heading}
            </h2>
            <p className="sto-lead sto-muted">{content.cta.body}</p>
            <a href={tel} className="sto-cta-phone">
              {site.phone}
            </a>
            <a href={tel} className="sto-btn">
              <PhoneGlyph />
              {content.cta.buttonLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="sto-footer">
        <div className="sto-wrap">
          <div className="sto-footer-grid sto-small" style={{ fontWeight: 400 }}>
            <div>
              <h2>{site.name}</h2>
              <p className="sto-muted">{content.serviceAreas.slice(0, 4).join(", ")}</p>
            </div>
            <div>
              <h2>Call</h2>
              <a href={tel}>{site.phone}</a>
            </div>
            <div>
              <h2>{site.address ? "Visit" : "Based in"}</h2>
              <address className="sto-muted">{site.address ?? site.city}</address>
            </div>
            {site.hours.length > 0 && (
              <div>
                <h2>Hours</h2>
                <ul className="sto-muted">
                  {site.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="sto-small sto-muted" style={{ marginTop: 32, fontWeight: 400 }}>
            © {year()} {site.name}
          </p>
        </div>
      </footer>

      <CallBar phone={site.phone} name={site.name} className="sto-callbar">
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
