import Link from 'next/link';

export const metadata = {
  title: 'Travel Blog | Ascenda',
  description:
    'Guides, tips, and inspiration to help you plan smarter and travel better.',
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag?: string;
};

const posts: Post[] = [
  {
    slug: 'hidden-gems-bali',
    title: '10 Hidden Gems in Bali (Beyond the Usual Spots)',
    excerpt:
      'Skip the crowds and discover secret beaches, jungle cafes, and quiet temples you’ll want to keep to yourself.',
    date: 'August 2025',
    tag: 'Destinations',
  },
  {
    slug: 'save-on-hotels-smart',
    title: 'How to Save on Hotels Without Compromising Comfort',
    excerpt:
      'Smart timing, flexible filters, and loyalty strategies that keep your stay upscale and your budget intact.',
    date: 'July 2025',
    tag: 'Money-Saving',
  },
  {
    slug: 'travel-insurance-2025',
    title: 'Why Travel Insurance Is a Must in 2025',
    excerpt:
      'Policies have changed—here’s what to look for so delays, cancellations, and medical costs don’t derail your plans.',
    date: 'June 2025',
    tag: 'Planning',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">Travel Blog</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-300">
          Guides, tips, and inspiration from the Ascenda team to help you plan smarter,
          travel better, and make the most of every trip.
        </p>
      </section>

      {/* posts */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="flex flex-col rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-white/10 text-white"
            >
              {p.tag ? (
                <span className="w-fit rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                  {p.tag}
                </span>
              ) : null}
              <h2 className="mt-3 line-clamp-2 text-2xl font-semibold">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-gray-300">{p.excerpt}</p>
              <div className="mt-4 text-sm text-gray-400">{p.date}</div>
              <div className="mt-5">
                <Link
                  href={`/blog/${p.slug}`}
                  className="inline-block rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-black hover:bg-blue-400"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
