"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowRightIcon from "@/components/arrow-right-icon";
import Reveal from "@/components/reveal";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { products, type Product, type ProductStatus } from "@/lib/merchandise";

const filters = ["All pieces", "Open Pre-Order", "Coming Soon", "Sold Out"] as const;
type Filter = (typeof filters)[number];

function ProductArtwork({ product }: { product: Product }) {
  return (
    <div className="product-art">
      <Image
        className="product-photo"
        src={product.image}
        alt={product.imageAlt}
        fill
        sizes="(max-width: 680px) 90vw, (max-width: 900px) 45vw, 29vw"
      />
      <span className={`product-status status-${product.status.toLowerCase().replaceAll(" ", "-")}`}>
        {product.status}
      </span>
    </div>
  );
}

export default function MerchandiseExperience() {
  const [filter, setFilter] = useState<Filter>("All pieces");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => filter === "All pieces" || product.status === (filter as ProductStatus)),
    [filter],
  );
  const selected = products.find((product) => product.id === selectedProduct);

  return (
    <>
      <SiteHeader />
      <main className="catalog-page">
        <section className="catalog-intro section-shell">
          <Link className="back-link" href="/#merchandise">← Back to Anargya</Link>
          <Reveal className="eyebrow">ANARGYA · TEAM GOODS</Reveal>
          <Reveal className="catalog-title-row">
            <h1>Made for the<br /><em>long way around.</em></h1>
            <p>A few things from our side of the track. Check back for updates on availability.</p>
          </Reveal>
          <div className="catalog-meta"><span>THE ANARGYA CATALOGUE</span><span>01 — 03</span></div>
        </section>

        <section className="catalog-list section-shell" aria-label="Merchandise catalogue">
          <Reveal className="catalog-toolbar">
            <p>{visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}</p>
            <div className="catalog-filters" aria-label="Filter by availability">
              {filters.map((option) => (
                <button
                  type="button"
                  className={filter === option ? "filter-button is-active" : "filter-button"}
                  key={option}
                  aria-pressed={filter === option}
                  onClick={() => {
                    setFilter(option);
                    setSelectedProduct(null);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="catalog-grid">
            {visibleProducts.map((product, index) => (
              <Reveal
                className="catalog-reveal"
                key={product.id}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <article className="catalog-card">
                  <ProductArtwork product={product} />
                  <div className="catalog-product-info">
                    <div className="catalog-product-topline">
                      <span>{product.category} · 0{index + 1}</span>
                      <span className={`availability-dot availability-${product.status.toLowerCase().replaceAll(" ", "-")}`} />
                    </div>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    <div className="catalog-product-bottom">
                      <span className="catalog-status-text">{product.status}</span>
                      <button
                        type="button"
                        className="product-detail-button"
                        aria-expanded={selectedProduct === product.id}
                        onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                      >
                        {selectedProduct === product.id ? "Close details" : "View details"}
                        {selectedProduct === product.id ? (
                          <span aria-hidden="true">−</span>
                        ) : (
                          <ArrowRightIcon />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {selected && (
            <Reveal className="product-detail-panel" aria-live="polite">
              <div>
                <p className="eyebrow">PRODUCT NOTE</p>
                <h2>{selected.name}</h2>
                <p>{selected.description}</p>
              </div>
              <div className="detail-availability">
                <span>Availability</span><strong>{selected.status}</strong>
              </div>
              <p className="catalog-note">
                Ordering details will be shared by the Anargya team when this item is available.
              </p>
            </Reveal>
          )}
        </section>

        <Reveal className="catalog-footnote section-shell">
          <span>TEAM GOODS, NOT JUST TEAM GEAR.</span>
          <Link className="text-link" href="https://www.instagram.com/anargya.its/" target="_blank">
            Follow availability updates
          </Link>
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
