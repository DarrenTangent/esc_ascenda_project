// app/blog/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

type PostData = { title: string; body: string; credits?: string; image?: string };

const posts: Record<string, PostData> = {
  'hidden-gems-bali': {
    title: '10 Hidden Gems in Bali (Beyond the Usual Spots)',
    body:
      'From quiet cliffside beaches to jungle coffee houses, these are the places our team returns to again and again. Start early, pack light, and always bring cash for local stalls. We recommend heading north for calmer waters and fewer crowds. Respect local customs and dress codes at temples.',
    credits: 'Photo: @yourphotog / Unsplash',
  },
  'save-on-hotels-smart': {
    title: 'How to Save on Hotels Without Compromising Comfort',
    body:
      'Book mid-week, watch for rate drops, and use flexible filters. Compare total price (taxes included) and look for properties with free cancellation windows. Consider business districts on weekends for luxury stays at lower prices. Loyalty programs and bundled bookings can add unexpected value.',
    credits: 'Photo: @hoteldesign / Unsplash',
  },
  'travel-insurance-2025': {
    title: 'Why Travel Insurance Is a Must in 2025',
    body:
      'With more frequent disruptions, basic coverage is no longer enough. Focus on policies that cover delays, cancellations, and medical expenses with clear limits. If you book multiple legs separately, confirm your policy covers missed connections between providers.',
    credits: 'Photo: @airsideview / Unsplash',
  },
};

export default async function BlogPostPage({
  params,
}: {
  // NOTE: params is a Promise in Next 15 for dynamic routes
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) return notFound();

  const heroSrc = post.image ?? `/blog/${slug}.jpg`;

  return (
    <div className="min-h-screen bg-blue-600 text-white">
      {/* Hero image */}
      <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden">
        <Image
          src={heroSrc}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">{post.title}</h1>
        {post.credits ? (
          <p className="mt-3 text-sm text-white/80">{post.credits}</p>
        ) : null}

        <div className="prose prose-invert mt-8 max-w-none">
          <p>{post.body}</p>
          <h3>Key Takeaways</h3>
          <ul>
            <li>Plan with flexibility—prices and policies change quickly.</li>
            <li>Compare total cost, not just nightly rates.</li>
            <li>Leverage off-peak days and neighborhoods.</li>
          </ul>
        </div>

        <Link
          href="/blog"
          className="mt-10 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-white/90"
        >
          Back to blog
        </Link>
      </article>
    </div>
  );
}
