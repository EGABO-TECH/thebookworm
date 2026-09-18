import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import BookModel from "@/models/Book";
import type { Book, Genre } from "@/types";
import BookDetailClient from "./BookDetailClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const UGX_RATE = 300;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const bookId = resolvedParams.id;

  try {
    await connectDB();
    const book = await BookModel.findById(bookId).lean();

    if (book) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const ogImageUrl = `${siteUrl}/api/og-image?id=${bookId}`;
      const description = (book.description as string) || `Check out ${book.title} on The Bookworm!`;

      return {
        title: `${book.title} | The Bookworm`,
        description,
        openGraph: {
          url: `${siteUrl}/book/${bookId}`,
          title: book.title as string,
          description,
          images: [{ url: ogImageUrl, width: 800, height: 1200, alt: book.title as string }],
        },
        twitter: {
          card: "summary_large_image",
          title: book.title as string,
          description,
          images: [ogImageUrl],
        },
      };
    }
  } catch (error) {
    console.error("Failed to generate metadata for book:", error);
  }

  return { title: "Book Not Found | The Bookworm" };
}

export default async function BookPage({ params }: Props) {
  const resolvedParams = await params;
  const bookId = resolvedParams.id;

  await connectDB();
  const bookDoc = await BookModel.findById(bookId).lean();

  if (!bookDoc) {
    notFound();
  }

  const book: Book = {
    id: (bookDoc._id as { toString(): string }).toString(),
    title: bookDoc.title,
    author: bookDoc.author,
    genre: (Array.isArray(bookDoc.genre) ? bookDoc.genre : (bookDoc.genre ? [bookDoc.genre] : ["Fiction"])) as Genre[],
    courses: Array.isArray(bookDoc.courses) ? (bookDoc.courses as string[]) : [],
    price: bookDoc.priceUGX / UGX_RATE,
    rating: 5.0,
    blurb: bookDoc.description,
    formats: ["PDF"],
    coverImageUrl: bookDoc.coverImageUrl,
  };

  // Fetch recommended books (simple logic matching genre or author)
  let recommendedDocs = await BookModel.find({
    _id: { $ne: bookDoc._id },
    isAvailable: { $ne: false },
    $or: [
      { author: bookDoc.author },
      { genre: { $in: Array.isArray(bookDoc.genre) ? bookDoc.genre : [bookDoc.genre] } }
    ]
  }).limit(6).lean();

  // If not enough recommendations, just grab some others
  if (recommendedDocs.length < 6) {
    const moreDocs = await BookModel.find({
      _id: { $ne: bookDoc._id },
      isAvailable: { $ne: false }
    }).limit(6 - recommendedDocs.length).lean();
    recommendedDocs = [...recommendedDocs, ...moreDocs];
  }

  const recommendedBooks: Book[] = recommendedDocs.map(doc => ({
    id: (doc._id as { toString(): string }).toString(),
    title: doc.title,
    author: doc.author,
    genre: (Array.isArray(doc.genre) ? doc.genre : (doc.genre ? [doc.genre] : ["Fiction"])) as Genre[],
    courses: Array.isArray(doc.courses) ? (doc.courses as string[]) : [],
    price: doc.priceUGX / UGX_RATE,
    rating: 5.0,
    blurb: doc.description,
    formats: ["PDF"],
    coverImageUrl: doc.coverImageUrl,
  }));

  return <BookDetailClient book={book} recommendedBooks={recommendedBooks} />;
}
