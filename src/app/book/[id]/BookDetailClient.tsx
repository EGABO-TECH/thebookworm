"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus, Minus, Share2, CopyCheck, ChevronLeft } from "lucide-react";
import { Book, Format } from "@/types";
import { useCurrency } from "@/hooks/useCurrency";
import { useAppContext } from "@/context/AppContext";
import { formatPrice } from "@/lib/currency";
import Header from "@/components/Header";
import Cover from "@/components/Cover";
import Rating from "@/components/Rating";
import CartDrawer from "@/components/CartDrawer";
import NylonPayModal from "@/components/NylonPayModal";

interface BookDetailClientProps {
  book: Book;
  recommendedBooks: Book[];
}

export default function BookDetailClient({ book, recommendedBooks }: BookDetailClientProps) {
  const router = useRouter();
  const currency = useCurrency();
  const { cart, wishlist, toggleWishlist, addToCart, changeQty, toggleChecked, cartCount } = useAppContext();

  const [selectedFormat, setSelectedFormat] = useState<Format>(book.formats[0] || "PDF");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [nylonOpen, setNylonOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedTotal = cart
    .filter((c) => c.checked)
    .reduce((sum, c) => sum + (c.book ? c.book.price : 0) * c.qty, 0);

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      navigator.share({ title: book.title, text: `Check out ${book.title} on The Bookworm!`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleAdd() {
    addToCart(book, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  function handleBuyNow() {
    addToCart(book, qty);
    setNylonOpen(true);
  }

  function handleSearchToggle() {
    if (!searchOpen) {
      setSearchOpen(true);
    } else {
      if (query.trim()) {
        router.push(`/?query=${encodeURIComponent(query)}`);
      } else {
        setSearchOpen(false);
      }
    }
  }

  const bgStyle = { background: "var(--color-bg)", minHeight: "100vh" };
  const borderStyle = { borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" };

  return (
    <div style={bgStyle}>
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        searchOpen={searchOpen}
        onSearchToggle={handleSearchToggle}
        query={query}
        onQueryChange={setQuery}
      />

      <main className="container" style={{ paddingBottom: 80, paddingTop: 20 }}>
        {/* Back button */}
        <button onClick={() => router.back()} className="detail-back-btn" aria-label="Go back">
          <ChevronLeft size={16} strokeWidth={2.5} />
          <span>Back</span>
        </button>

        {/* Hero card — selected book is the star */}
        <div className="detail-hero-card">
          <div className="detail-grid">

            {/* Cover */}
            <div className="detail-cover-wrap">
              <Cover
                book={book}
                size="detail"
                wishlisted={wishlist.includes(book.id)}
                onToggleWishlist={toggleWishlist}
              />
            </div>

            {/* Info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h1 className="detail-title">{book.title}</h1>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    <span style={{ color: "var(--color-ink-muted)", fontSize: "0.88rem", fontWeight: 600 }}>{book.author}</span>
                    <Rating value={book.rating} size={13} id={book.id} />
                  </div>
                </div>
                <button
                  className="icon-circle"
                  onClick={handleShare}
                  aria-label={copied ? "Link copied" : "Share this book"}
                  style={copied ? { color: "var(--color-green)", flexShrink: 0 } : { flexShrink: 0 }}
                >
                  {copied ? <CopyCheck size={16} strokeWidth={2.2} /> : <Share2 size={16} strokeWidth={2.2} />}
                </button>
              </div>

              {/* Genres */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: 12 }}>
                {(Array.isArray(book.genre) ? book.genre : [book.genre]).map((g, idx) => (
                  <div key={idx} className="genre-badge">{g}</div>
                ))}
              </div>

              {/* Format */}
              {book.formats.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div className="meta-label" style={{ marginBottom: 8 }}>FORMAT</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {book.formats.map((f) => (
                      <button
                        key={f}
                        className={`format-pill${selectedFormat === f ? " active" : ""}`}
                        onClick={() => setSelectedFormat(f)}
                        aria-pressed={selectedFormat === f}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div style={{ marginTop: 18 }}>
                <div className="meta-label" style={{ marginBottom: 6 }}>DESCRIPTION</div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "var(--color-ink)", margin: 0, fontWeight: 500 }}>
                  {book.blurb}
                </p>
              </div>

              {/* Qty + price */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 20, padding: "14px 0", ...borderStyle }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button className="step-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: "1rem", minWidth: 22, textAlign: "center", fontWeight: 700 }}>{qty}</span>
                  <button className="step-btn" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                    <Plus size={12} />
                  </button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="meta-label">TOTAL</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-green)", lineHeight: 1.1 }}>
                    {formatPrice(book.price * qty, currency)}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }} className="detail-cta-row">
                <button
                  className="btn-black"
                  onClick={handleAdd}
                  style={{ flex: 1, padding: "13px 16px", fontSize: "0.85rem", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.03em" }}
                  aria-label={justAdded ? "Added to cart" : "Add to cart"}
                >
                  {justAdded ? <><Check size={16} /> ADDED</> : "ADD TO CART"}
                </button>
                <button
                  className="btn-primary"
                  onClick={handleBuyNow}
                  style={{ padding: "13px 20px", fontSize: "0.85rem", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.03em", whiteSpace: "nowrap" }}
                  aria-label="Buy now"
                >
                  BUY NOW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations — visually subordinate */}
        {recommendedBooks.length > 0 && (
          <div className="recommendations-section" style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: "0.75rem", marginBottom: 14, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink-muted)" }}>
              You May Also Like
            </h3>
            <div className="recommendations-row">
              {recommendedBooks.map((item) => (
                <Link
                  key={String(item.id)}
                  href={`/book/${item.id}`}
                  className="recommendation-card"
                  style={{ textDecoration: "none", color: "inherit" }}
                  aria-label={`View ${item.title} by ${item.author}`}
                >
                  <div className="recommendation-cover-wrap"><Cover book={item} size="mini" /></div>
                  <div className="recommendation-text">
                    <span className="recommendation-title">{item.title}</span>
                    <span className="recommendation-author">{item.author}</span>
                    <span className="recommendation-price">{formatPrice(item.price, currency)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-top">
            <div className="footer-brand-wrap">
              <div className="footer-brand-mark">
                <Image src="/logo-icon.png" alt="The Bookworm" width={52} height={52} priority />
              </div>
              <div className="footer-brand-copy">
                <span className="footer-brand-title">The Bookworm</span>
                <span className="footer-brand-desc">The digital archive for curious minds, life-long learners, tech enthusiasts, students and those who just need a companion to easily access a book.</span>
              </div>
            </div>
            <span className="footer-value-prop">Pay once via Mobile Money &bull; Download instantly &bull; <Link href="/keep-forever" style={{ color: "inherit", textDecoration: "none" }}>Keep forever.</Link></span>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">&copy; 2026 The Bookworm</span>
            <div className="footer-links">
              <Link href="/lookup">Find My Books</Link>
              <Link href="/terms">Terms of Use</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/disclaimer">Disclaimers</Link>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onQtyChange={changeQty}
        onToggleChecked={toggleChecked}
        onCheckout={() => { setCartOpen(false); setNylonOpen(true); }}
        currency={currency}
      />

      {nylonOpen && (
        <NylonPayModal
          total={selectedTotal}
          currency={currency}
          cart={cart.filter(c => c.checked)}
          onClose={() => setNylonOpen(false)}
          onSuccess={() => { setNylonOpen(false); }}
        />
      )}
    </div>
  );
}