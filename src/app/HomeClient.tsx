"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Book, CartLine, Genre } from "@/types";
import { useCurrency } from "@/hooks/useCurrency";
import { useAppContext } from "@/context/AppContext";
import Header from "@/components/Header";
import Hero from "../components/Hero";
import GenreFilter from "@/components/GenreFilter";
import BookGrid from "@/components/BookGrid";
import BookList from "@/components/BookList";
import ViewTabs from "@/components/ViewTabs";
import CartDrawer from "@/components/CartDrawer";
import NylonPayModal from "@/components/NylonPayModal";

interface HomeClientProps {
  initialBooks: Book[];
}

export default function HomeClient({ initialBooks }: HomeClientProps) {
  const currency = useCurrency();
  const router = useRouter();
  
  const { cart, setCart, wishlist, toggleWishlist, changeQty, toggleChecked, cartCount } = useAppContext();


  // Filter state
  const [genre, setGenre] = useState<"All" | Genre>("All");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Books state — seeded from server so they appear instantly
  const [books] = useState<Book[]>(initialBooks);

  // Cart Drawer
  const [cartOpen, setCartOpen] = useState(false);

  // Nylon Pay
  const [nylonOpen, setNylonOpen] = useState(false);

  // Derived
  const filtered = useMemo(() => {
    return books.filter((b) => {
      // Check if genre matches (handle both array and single string temporarily)
      const bookGenres = Array.isArray(b.genre) ? b.genre : [b.genre];
      const genreOk = genre === "All" || bookGenres.includes(genre);
      
      const q = query.trim().toLowerCase();
      const queryOk =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.courses ?? []).some((c) => c.toLowerCase().includes(q));
      return genreOk && queryOk;
    });
  }, [books, genre, query]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [genre, query]);

  // Compute paginated books
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const [view, setView] = useState<"grid" | "list">("grid");

  const selectedTotal = useMemo(() => {
    return cart
      .filter((c) => c.checked)
      .reduce((sum, c) => {
        return sum + (c.book?.price ?? 0) * c.qty;
      }, 0);
  }, [cart]);

  // Handlers
  function handleCheckout() {
    setCartOpen(false);
    setNylonOpen(true);
  }

  function handlePaySuccess() {
    setNylonOpen(false);
    setCart([]);
  }


  function handleSearchToggle() {
    setSearchOpen((s) => {
      if (s) setQuery(""); // clear on close
      return !s;
    });
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        searchOpen={searchOpen}
        onSearchToggle={handleSearchToggle}
        query={query}
        onQueryChange={setQuery}
      />

      <main>
        <Hero />

        <GenreFilter active={genre} onChange={setGenre} />

        <section className="container section-gap" style={{ paddingBottom: 100 }}>
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <ViewTabs view={view} onChange={setView} />
            </div>
            {view === 'grid' ? (
              <BookGrid
                books={paginatedBooks}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                currency={currency}
              />
            ) : (
              <BookList
                books={paginatedBooks}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                currency={currency}
              />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrap">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
            <div className="footer-top">
            <div className="footer-brand-wrap">
              <div className="footer-brand-mark">
                <Image
                  src="/logo-icon.png"
                  alt="The Bookworm"
                  width={52}
                  height={52}
                  priority
                />
              </div>
              <div className="footer-brand-copy">
                <span className="footer-brand-title">The Bookworm</span>
                <span className="footer-brand-desc">
                  The digital archive for curious minds, life-long learners, tech enthusiasts, students and those who just need a companion to easily access a book.
                </span>
              </div>
            </div>
            <span className="footer-value-prop">
              Pay once via Mobile Money &bull; Download instantly &bull; <Link href="/keep-forever" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Keep forever.</Link>
            </span>
          </div>
          <div className="footer-bottom">
            <span className="footer-copyright">
              &copy; 2026 The Bookworm
            </span>
            <div className="footer-links">
              <Link href="/lookup">Find My Books</Link>
              <Link href="/terms">Terms of Use</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/disclaimer">Disclaimers</Link>
            </div>
          </div>
        </div>
      </footer>      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onQtyChange={changeQty}
        onToggleChecked={toggleChecked}
        onCheckout={handleCheckout}
        currency={currency}
      />

      {/* Nylon Pay */}
      {nylonOpen && (
        <NylonPayModal
          total={selectedTotal}
          currency={currency}
          cart={cart.filter(c => c.checked)}
          onClose={() => setNylonOpen(false)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
