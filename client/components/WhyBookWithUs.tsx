// components/WhyBookWithUs.tsx
export default function WhyBookWithUs() {
  const items = [
    { title: 'Best Price Guarantee', desc: 'We compare top suppliers to get you the lowest rate.', icon: '💸' },
    { title: 'Flexible Cancellation', desc: 'Clear policies so you can travel with confidence.', icon: '🧾' },
    { title: '24/7 Support', desc: 'Real humans ready to help anytime, anywhere.', icon: '🕑' },
    { title: 'Handpicked Hotels', desc: 'Well-rated stays curated for comfort and value.', icon: '🏨' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-6 text-3xl md:text-[2rem] font-light tracking-[-0.01em] leading-tight text-neutral-900">
        Why book with Ascenda
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl bg-white/90 p-5 ring-1 ring-black/5 shadow-sm">
            <div className="mb-3 text-2xl">{item.icon}</div>
            <h3 className="text-[15px] font-semibold text-neutral-900 tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
