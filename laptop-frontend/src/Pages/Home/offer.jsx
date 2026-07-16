// LaptopDeals.jsx
import React from 'react';

const deals = [
  {
    id: 1,
    title: 'Macbook',
    subtitle: 'With M3 Chip',
    discount: '40% OFF',
    icon: '💻',
    bgGradient: 'from-indigo-50 to-purple-50',
    badgeColor: 'bg-indigo-600',
    textColor: 'text-indigo-700',
    hoverBorder: 'hover:border-indigo-300',
  },
  {
    id: 2,
    title: 'Premium',
    subtitle: 'Laptop',
    discount: '50% OFF',
    icon: '⚡',
    bgGradient: 'from-blue-50 to-cyan-50',
    badgeColor: 'bg-blue-600',
    textColor: 'text-blue-700',
    hoverBorder: 'hover:border-blue-300',
  },
  {
    id: 3,
    title: 'OG Gaming',
    subtitle: 'Laptop',
    discount: '50% OFF',
    icon: '🎮',
    bgGradient: 'from-red-50 to-rose-50',
    badgeColor: 'bg-red-600',
    textColor: 'text-red-700',
    hoverBorder: 'hover:border-red-300',
  },
  {
    id: 4,
    title: '2 in 1',
    subtitle: 'Laptop',
    discount: '50% OFF',
    icon: '🔄',
    bgGradient: 'from-emerald-50 to-teal-50',
    badgeColor: 'bg-emerald-600',
    textColor: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-300',
  },
];

const DealCard = ({ deal }) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 border-white/80
        bg-gradient-to-br ${deal.bgGradient}
        p-6 md:p-8
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:scale-[1.01] hover:shadow-2xl
        ${deal.hoverBorder}
        shadow-sm
      `}
    >
      {/* decorative blur circle */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/30 blur-2xl" />

      {/* icon + badge */}
      <div className="relative flex items-start justify-between">
        <span className="text-4xl md:text-5xl">{deal.icon}</span>
        <span
          className={`
            inline-flex animate-pulse items-center rounded-full
            ${deal.badgeColor} px-4 py-1.5 text-sm font-bold
            uppercase tracking-wider text-white shadow-lg
          `}
        >
          {deal.discount}
        </span>
      </div>

      {/* title */}
      <div className="relative mt-6">
        <h3 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
          {deal.title}
        </h3>
        <p className="mt-0.5 text-lg font-medium text-slate-600">
          {deal.subtitle}
        </p>
      </div>

      <div className="relative my-4 h-px w-12 bg-slate-300/60" />

      {/* Shop Now button */}
      <div className="relative mt-2">
        <button
          className={`
            group inline-flex items-center gap-2
            rounded-full bg-white/70 px-6 py-2.5
            text-sm font-semibold ${deal.textColor}
            backdrop-blur-sm transition-all
            hover:bg-white hover:shadow-md
            border border-white/50
            hover:gap-3
          `}
        >
          Shop Now
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const LaptopDeals = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            🔥 Limited Time
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-800 md:text-5xl">
            Premium Laptop <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Deals
            </span>
          </h1>
          <p className="mt-2 text-slate-500">Grab the best offers on top-tier laptops</p>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          * Offers valid while stocks last. Terms &amp; conditions apply.
        </p>
      </div>
    </div>
  );
};

export default LaptopDeals;