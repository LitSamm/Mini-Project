"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArrowRightIcon from "@/components/arrow-right-icon";
import Reveal from "@/components/reveal";
import Mark6Viewer from "@/components/mark6-viewer";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { journeys } from "@/lib/journeys";
import type { Product } from "@/lib/merchandise";

type HomeExperienceProps = {
  products: Product[];
};

const slides = [
  {
    eyebrow: "UPCOMING EVENT · GIIAS 2027",
    title: <>The Next<br />Challenge Awaits.</>,
    description: "A new stage for Anargya ITS Formula EV Team.",
    image: "/images/hero-giias.webp",
    action: "Explore event",
    href: "/journey/giias-2027",
  },
  {
    eyebrow: "MADE AT ITS · SURABAYA",
    title: <>Electric,<br />by design.</>,
    description: "Curiosity, engineering, and a team built around the next turn.",
    image: "/images/fsae-2025-track.webp",
    action: "Meet the team",
    href: "#team",
  },
];

const teamStatuses = {
  Upcoming: {
    heading: "GIIAS 2027",
    copy: "The next public chapter is on the horizon. Follow the team as preparations take shape.",
    detail: "NEXT UP",
    link: "/journey/giias-2027",
    linkLabel: "Explore the event",
  },
  "On Going": {
    heading: "Back to the workshop",
    copy: "Design, fabrication, and validation are part of the continuous work behind every build.",
    detail: "IN THE WORKS",
    link: "/journey/inside-the-workshop",
    linkLabel: "Inside the workshop",
  },
  Completed: {
    heading: "A season in the books",
    copy: "Every iteration leaves the team with new questions, useful lessons, and a stronger starting point.",
    detail: "LOOKING BACK",
    link: "/journey/electric-by-design",
    linkLabel: "Read the team story",
  },
} as const;

const statusNames = ["Upcoming", "On Going", "Completed"] as const;
type TeamStatus = (typeof statusNames)[number];

export default function HomeExperience({ products }: HomeExperienceProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [teamStatus, setTeamStatus] = useState<TeamStatus>("Upcoming");
  const heroRef = useRef<HTMLElement>(null);
  const slide = slides[activeSlide];
  const currentStatus = teamStatuses[teamStatus];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    function updateParallax() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const hero = heroRef.current;
        if (!hero) return;

        hero.style.setProperty(
          "--hero-scroll-offset",
          `${Math.min(window.scrollY * 0.12, 72)}px`,
        );
      });
    }

    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateParallax);
    };
  }, []);

  function moveSlide(direction: number) {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section
          ref={heroRef}
          className="hero"
          aria-roledescription="carousel"
          aria-label="Anargya highlights"
          style={{ backgroundImage: `url("${slide.image}")` }}
        >
          <div className="hero-shade" />
          <div className="hero-content" key={activeSlide}>
            <p className="eyebrow hero-eyebrow">
              <span className="live-dot" />
              {slide.eyebrow}
            </p>
            <h1>{slide.title}</h1>
            <p className="hero-description">{slide.description}</p>
            <Link className="button button-green" href={slide.href}>
              {slide.action}<ArrowRightIcon />
            </Link>
          </div>
          <div className="hero-bottom">
            <p className="hero-caption">ANARGYA ITS FORMULA EV TEAM</p>
            <div className="slide-controls" aria-label="Hero slides">
              <span className="slide-index">0{activeSlide + 1}<i>/</i>0{slides.length}</span>
              <button
                type="button"
                className="slide-arrow"
                aria-label="Previous slide"
                onClick={() => moveSlide(-1)}
              >
                ←
              </button>
              <button
                type="button"
                className="slide-arrow"
                aria-label="Next slide"
                onClick={() => moveSlide(1)}
              >
                →
              </button>
            </div>
          </div>
          <span className="hero-side-note">STUDENT BUILT · ELECTRIC POWERED</span>
        </section>

        <section className="about-section section-shell" id="about">
          <Reveal className="about-image-wrap about-event-poster">
            <Image
              src="/images/giias-2027-poster.png"
              alt="Poster GIIAS 2027: The Machine is Here, menampilkan mobil Formula EV Anargya dengan latar gedung Jakarta"
              fill
              sizes="(max-width: 760px) 88vw, 40vw"
            />
          </Reveal>
          <Reveal className="about-copy">
            <p className="eyebrow">ANARGYA ITS · RESEARCH TEAM</p>
            <h2>Ideas don&apos;t<br />stay in the <em>lab.</em></h2>
            <p className="about-description">
              Anargya is a student-led Formula EV team from Institut Teknologi
              Sepuluh Nopember. Students across disciplines turn research,
              design, and engineering into ideas built to move.
            </p>
            <p className="about-description about-giias-reason">
              At GIIAS 2027, we want to introduce Anargya and our work to a
              wider audience, connect with the automotive community, and
              inspire more people to help shape the future of electric
              mobility.
            </p>
            <Link className="text-link" href="/journey/giias-2027">
              Why GIIAS 2027
            </Link>
            <div className="about-footnote">
              <span>01 — RESEARCH</span><span>02 — ENGINEERING</span><span>03 — TEAMWORK</span>
            </div>
          </Reveal>
        </section>

        <section className="intro-ribbon" aria-label="About Anargya">
          <span>BASED IN SURABAYA</span>
          <span className="ribbon-mark" aria-hidden="true">×</span>
          <span>BUILT BY STUDENTS</span>
          <span className="ribbon-mark" aria-hidden="true">×</span>
          <span>MADE FOR THE TRACK</span>
        </section>

        <section className="status-section section-shell" id="team">
          <Reveal className="section-heading status-heading">
            <div>
              <p className="eyebrow">ITS FORMULA EV TEAM</p>
              <h2>Progress, <em>in motion.</em></h2>
            </div>
            <p className="section-aside">
              A student team working across disciplines to design, build, and race electric formula cars.
            </p>
          </Reveal>
          <Reveal className="status-tabs" role="tablist" aria-label="Team status">
            {statusNames.map((status) => (
              <button
                className={`status-tab${teamStatus === status ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={teamStatus === status}
                key={status}
                onClick={() => setTeamStatus(status)}
              >
                <span className="tab-dot" />
                {status}
              </button>
            ))}
          </Reveal>
          <Reveal
            className={`status-card status-card--${teamStatus === "On Going" ? "ongoing" : teamStatus.toLowerCase()}`}
            role="tabpanel"
          >
            <div className="status-card-image" aria-hidden="true" />
            <div className="status-card-overlay" aria-hidden="true" />
            <div className="status-card-main">
              <p className="eyebrow status-label">
                <span className="live-dot" />{currentStatus.detail}
              </p>
              <h3>{currentStatus.heading}</h3>
              <p>{currentStatus.copy}</p>
              <Link className="text-link" href={currentStatus.link}>
                {currentStatus.linkLabel}
              </Link>
            </div>
            <div className={`status-card-side${teamStatus === "Completed" ? " has-achievements" : ""}`}>
              {teamStatus === "Completed" ? (
                <Image
                  className="status-achievements"
                  src="/images/team-achievements-2025.webp"
                  alt="Award badges from Anargya's past Formula Student events"
                  width={920}
                  height={638}
                />
              ) : (
                <>
                  <span className="status-count">0{statusNames.indexOf(teamStatus) + 1}</span>
                  <span className="status-count-caption">TEAM<br />UPDATE</span>
                  <span className="status-orbit" aria-hidden="true" />
                </>
              )}
            </div>
          </Reveal>
        </section>

        <section className="mark6-section" id="mark-6">
          <div className="mark6-feature section-shell">
            <Reveal className="mark6-copy">
              <p className="eyebrow">ANARGYA · FORMULA EV</p>
              <h2>MARK <span>06</span></h2>
              <p className="mark6-description">
                Designed and built by Anargya ITS, the Mark 06 is an all-electric
                formula car made for the demands of the track.
              </p>
              <dl className="mark6-specs">
                <div>
                  <dt>Weight</dt>
                  <dd aria-label="To be announced">—</dd>
                </div>
                <div>
                  <dt>Power</dt>
                  <dd aria-label="To be announced">—</dd>
                </div>
                <div>
                  <dt>Battery</dt>
                  <dd aria-label="To be announced">—</dd>
                </div>
                <div>
                  <dt>Top speed</dt>
                  <dd aria-label="To be announced">—</dd>
                </div>
              </dl>
            </Reveal>
            <Reveal className="mark6-viewer-reveal">
              <Mark6Viewer />
            </Reveal>
          </div>
        </section>

        <section className="merch-section section-shell" id="merchandise">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">OFF THE TRACK</p>
              <h2>Carry a little <em>Anargya.</em></h2>
            </div>
            <Link className="text-link" href="/merchandise">
              View the catalogue
            </Link>
          </Reveal>
          <div className="merch-preview-grid">
            {products.map((product, index) => (
              <Reveal
                className="merch-preview-reveal"
                key={product.id}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <Link className="merch-preview-card" href="/merchandise">
                  <div className="product-art">
                    <Image
                      className="product-photo"
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      sizes="(max-width: 680px) 90vw, (max-width: 900px) 45vw, 29vw"
                    />
                    <span className="product-number">0{index + 1}</span>
                    <span className={`product-status status-${product.status.toLowerCase().replaceAll(" ", "-")}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="product-preview-copy">
                    <div><h3>{product.name}</h3><span>{product.category}</span></div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="track-section section-shell" id="track-record">
          <Reveal className="section-heading track-heading">
            <div>
              <p className="eyebrow">TRACK RECORD</p>
              <h2>More than a <em>finish line.</em></h2>
            </div>
            <p className="section-aside">
              The people, builds, and moments that make every next challenge possible.
            </p>
          </Reveal>
          <div className="journey-grid">
            {journeys.map((journey, index) => (
              <Reveal
                className="journey-reveal"
                key={journey.slug}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Link className="journey-card" href={`/journey/${journey.slug}`}>
                  <div className={`journey-image journey-image-${index + 1}`}>
                    <Image
                      src={journey.image}
                      alt={journey.imageAlt}
                      fill
                      sizes="(max-width: 760px) 100vw, 33vw"
                    />
                    <span className="journey-number">0{index + 1}</span>
                  </div>
                  <div className="journey-copy">
                    <p className="eyebrow">{journey.eyebrow}</p>
                    <h3>{journey.slug === "giias-2027" ? "GIIAS 2027" : journey.title}</h3>
                    <span>Explore the journey <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="closing-section">
          <Reveal className="closing-content">
            <p className="eyebrow">ANARGYA ITS · FORMULA EV</p>
            <h2>The next challenge<br /><em>is already taking shape.</em></h2>
            <Link className="button button-light" href="/journey/giias-2027">
              Follow the journey<ArrowRightIcon />
            </Link>
          </Reveal>
          <span className="closing-coordinate">SURABAYA, INDONESIA<br />— BUILT FOR WHAT&apos;S NEXT</span>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
