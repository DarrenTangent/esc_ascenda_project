export const metadata = {
  title: 'About | Ascenda Travel',
  description:
    'Learn how Ascenda helps travelers find great stays with transparent pricing and a fast, seamless booking experience.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-grey-900">
      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          About Ascenda
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white">
          We help travelers find stays they’ll love—quickly, clearly, and at a fair
          price. From inspiration to checkout, Ascenda keeps the experience simple
          and transparent so you can spend more time exploring and less time
          comparing tabs.
        </p>
      </section>

      {/* stats */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard title="5,000+" caption="Hotels compared daily" />
          <StatCard title="98%" caption="Price transparency score" />
          <StatCard title="< 2s" caption="Average results load time" />
          <StatCard title="24/7" caption="Email support response" />
        </div>
      </section>

      {/* mission & how we help */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FeatureCard
            title="Our Mission"
            body="Travel should be accessible to everyone. That’s why we focus on price clarity, unbiased hotel comparisons, and lightning-fast search so you can find a great place—without the guesswork."
          />
          <FeatureCard
            title="How Ascenda Helps"
            body="From solo trips to family getaways, our tools make planning easy: intelligent search, curated picks, clear fees, secure checkout, and flexible filters so you always book with confidence."
          />
        </div>
      </section>

      {/* values */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-3xl font-bold text-black">What We Value</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ValueCard
            title="Transparency"
            body="No hidden fees. Clear prices, taxes, and policies up front."
          />
          <ValueCard
            title="Speed"
            body="Search and sort thousands of stays in seconds—not minutes."
          />
          <ValueCard
            title="Trust"
            body="Reliable data, secure payments, and responsive human support."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, caption }: { title: string; caption: string }) {
  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-white/10 text-white">
      <div className="text-3xl font-bold">{title}</div>
      <div className="mt-1">{caption}</div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-white/10 text-white">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-3 leading-relaxed">{body}</p>
    </div>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-white/10 text-white">
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="mt-2">{body}</p>
    </div>
  );
}
