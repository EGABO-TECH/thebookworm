"use client";

import Link from "next/link";

import { Book } from "@/types";
import { CurrencyConfig } from "@/types";
import { formatPrice } from "@/lib/currency";
import Cover from "./Cover";

interface BookListProps {
  books: Book[];
  wishlist: (string | number)[];
  onToggleWishlist: (id: string | number) => void;
  currency: CurrencyConfig;
}

export default function BookList({ books, wishlist, onToggleWishlist, currency }: BookListProps) {
  return (
    <div className="book-list">
      {books.map((b) => (
        <Link key={b.id} href={`/book/${b.id}`} className="book-list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="book-list-cover"><Cover book={b} wishlisted={wishlist.includes(b.id)} onToggleWishlist={onToggleWishlist} /></div>
          <div className="book-list-body">
            <div className="book-card-title">{b.title}</div>
            <div className="book-card-meta"><span>{b.author}</span><span>{formatPrice(b.price, currency)}</span></div>
            <p className="book-list-blurb">{b.blurb}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
