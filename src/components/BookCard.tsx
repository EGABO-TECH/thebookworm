"use client";

import React from "react";
import Link from "next/link";
import { Book, CurrencyConfig } from "@/types";
import Cover from "./Cover";
import Rating from "./Rating";
import { formatPrice } from "@/lib/currency";

interface BookCardProps {
  book: Book;
  wishlisted: boolean;
  onToggleWishlist: (id: string | number) => void;
  currency: CurrencyConfig;
}

export default function BookCard({
  book,
  wishlisted,
  onToggleWishlist,
  currency,
}: BookCardProps) {
  return (
    <Link
      href={`/book/${book.id}`}
      className="book-card"
      aria-label={`View ${book.title} by ${book.author}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Cover
        book={book}
        wishlisted={wishlisted}
        onToggleWishlist={onToggleWishlist}
      />
      <div className="book-card-content">
        <div className="book-card-title">
          {book.title}
        </div>
        <div className="book-card-meta">
          <span className="book-card-author">
            {book.author}
          </span>
          <Rating value={book.rating} id={book.id} />
        </div>
        <div className="book-card-price">
          {formatPrice(book.price, currency)}
        </div>
      </div>
    </Link>
  );
}
