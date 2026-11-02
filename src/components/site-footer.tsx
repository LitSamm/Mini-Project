import Image from "next/image";
import Link from "next/link";

const currentYear = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <section className="footer-about" aria-label="About Anargya">
          <Link className="footer-brand" href="/" aria-label="Anargya ITS home">
            <Image
              src="/images/anargya-wordmark.webp"
              alt="Anargya ITS Formula EV Team"
              width={288}
              height={37}
            />
          </Link>
          <p>
            Anargya derives from Sanskrit meaning <span>&quot;Infinite Value.&quot;</span>{" "}
            We are Institut Teknologi Sepuluh Nopember&apos;s premier collegiate electric
            formula race team, advancing sustainable motorsport technology through
            rigorous telemetry, digital-twin modeling, and international competition.
          </p>
          <div className="footer-social-links" role="group" aria-label="Follow Anargya ITS">
            <a
              className="footer-social-link"
              href="https://www.instagram.com/anargya.its?utm_source=ig_web_button_share_sheet&rpxt=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Anargya ITS on Instagram"
              title="Instagram"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="17.7" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              className="footer-social-link"
              href="https://www.youtube.com/@anargyaitsteam1003"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Anargya ITS Team on YouTube"
              title="YouTube"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 7.2a2.8 2.8 0 0 0-2-2C17.2 4.7 12 4.7 12 4.7s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.5 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 21.5 12a29 29 0 0 0-.5-4.8Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="m10 15.5 5-3.5-5-3.5v7Z" fill="currentColor" />
              </svg>
            </a>
            <a
              className="footer-social-link"
              href="https://www.tiktok.com/@anargya.its"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Anargya ITS on TikTok"
              title="TikTok"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.5 3.5c.3 2.5 1.7 4 4.5 4.2v3.2a9.1 9.1 0 0 1-4.5-1.4v6.2a5.8 5.8 0 1 1-5.8-5.8c.5 0 1 .1 1.5.2v3.4a2.6 2.6 0 1 0 1.1 2.2V3.5h3.2Z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </section>

        <nav className="footer-column" aria-label="Footer navigation">
          <h2>Navigation</h2>
          <Link href="/">Home Overview</Link>
          <Link href="/#team">The Team</Link>
          <Link href="/#track-record">Track Record</Link>
          <Link href="/journey/giias-2027">GIIAS 2027</Link>
          <Link href="/merchandise">Official Merch Store</Link>
          <Link href="/admin/login">Admin</Link>
        </nav>

        <section className="footer-column">
          <h2>Platform &amp; Tech</h2>
          <Link className="footer-feature-link" href="/journey/giias-2027">
            Explore the next challenge
          </Link>
          <div className="footer-badges" aria-label="Platform details">
            <span>Next.js App Router</span>
            <span>Formula EV Team</span>
          </div>
        </section>

        <section className="footer-column footer-contact">
          <h2>Headquarters</h2>
          <a
            className="footer-contact-link footer-address"
            href="https://www.google.com/maps/search/?api=1&query=Gedung+Riset+Mobil+Listrik+ITS+Sukolilo+Surabaya"
            target="_blank"
            rel="noreferrer"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <path
                d="M16 8.3c0 4.1-6 9.2-6 9.2S4 12.4 4 8.3a6 6 0 1 1 12 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>
              Gedung Riset Mobil Listrik (PUI-SKO), Kampus ITS Sukolilo, Surabaya,
              Jawa Timur 60111
            </span>
          </a>
          <a className="footer-contact-link" href="mailto:contact@anargyaits.com">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <rect
                x="2.75"
                y="4.25"
                width="14.5"
                height="11.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m3.5 5 6.5 5 6.5-5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span>contact@anargyaits.com</span>
          </a>
        </section>
      </div>

      <div className="footer-bottom">
        <span>
          © {currentYear} Anargya ITS EV Team. All rights reserved.
        </span>
        <p>
          <a href="https://www.its.ac.id/" target="_blank" rel="noreferrer">
            Institut Teknologi Sepuluh Nopember
          </a>
          <span aria-hidden="true">•</span>
          <span>Built for what&apos;s next</span>
        </p>
      </div>
    </footer>
  );
}
