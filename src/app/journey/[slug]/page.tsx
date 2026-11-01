import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import ArrowRightIcon from "@/components/arrow-right-icon";
import Reveal from "@/components/reveal";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { journeys } from "@/lib/journeys";

type JourneyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return journeys.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = journeys.find((entry) => entry.slug === slug);

  return journey
    ? {
        title: `${journey.slug === "giias-2027" ? "GIIAS 2027" : journey.title} — Anargya ITS`,
        description: journey.description,
      }
    : { title: "Journey — Anargya ITS" };
}

export default function JourneyPage({ params }: JourneyPageProps) {
  return (
    <Suspense fallback={<JourneyLoading />}>
      <JourneyContent params={params} />
    </Suspense>
  );
}

function JourneyLoading() {
  return (
    <>
      <SiteHeader />
      <main className="journey-page">
        <section className="journey-detail-hero" aria-busy="true">
          <p className="eyebrow">Loading journey details…</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

async function JourneyContent({ params }: JourneyPageProps) {
  const { slug } = await params;
  const journey = journeys.find((entry) => entry.slug === slug);

  if (!journey) notFound();

  return (
    <>
      <SiteHeader />
      <main className="journey-page">
        <section className="journey-detail-hero">
          <Image
            src={journey.image}
            alt={journey.imageAlt}
            fill
            priority
            sizes="100vw"
          />
          <div className="journey-detail-shade" />
          <Link className="journey-back" href="/#track-record">← Back to the journey</Link>
          <Reveal className="journey-detail-heading">
            <p className="eyebrow"><span className="live-dot" />{journey.eyebrow}</p>
            <h1>{journey.slug === "giias-2027" ? <>GIIAS<br /><em>2027</em></> : journey.title}</h1>
            <p>{journey.description}</p>
          </Reveal>
          <span className="journey-detail-status">{journey.status}</span>
        </section>

        <section className="journey-overview section-shell">
          <Reveal>
            <p className="eyebrow">THE OVERVIEW</p>
            <h2>A little more<br />about <em>the journey.</em></h2>
          </Reveal>
          <Reveal className="journey-body">
            {journey.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {journey.slug === "giias-2027" && (
              <p className="event-note">Event details will be added as they are confirmed.</p>
            )}
            <Link className="text-link" href="/#track-record">
              Explore more stories
            </Link>
          </Reveal>
        </section>

        <section className="journey-next">
          <Reveal>
            <p className="eyebrow">KEEP MOVING</p>
            <h2>Every build<br />starts <em>somewhere.</em></h2>
          </Reveal>
          <Reveal className="journey-cta">
            <Link className="button button-green" href="/#team">
              Meet the team<ArrowRightIcon />
            </Link>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
