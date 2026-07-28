
import React, { useState } from "react";
import image1 from "../../assets/crazy/image 1.png";
import image2 from "../../assets/crazy/image 10 (1).png";
import image3 from "../../assets/crazy/image 10 (2).png";
import image4 from "../../assets/crazy/image 10 (3).png";
import image5 from "../../assets/crazy/image 10 (4).png";
import image6 from "../../assets/crazy/image 10 (5).png";
import image7 from "../../assets/crazy/image 10 (6).png";
import image8 from "../../assets/crazy/image 10 (7).png";
import image9 from "../../assets/crazy/image 1.png";
import image10 from "../../assets/crazy/image 10 (8).png";

const filters = [
  { label: "MacBook", sub: "Up to 50% off" },
  { label: "Premium laptops", sub: "Up to 35% off" },
  { label: "OG gaming laptops", sub: "Up to 20% off" },
  { label: "2 in 1 laptops", sub: "Up to 15% off" },
];

const products = [
  {
    brand: "Apple",
    badge: "47% off",
    title: "Refurbished | Apple MacBook Pro A2485 | M1 Pro | 16\" HD Retina Display",
    price: 79999,
    mrp: 150000,
    warranty: "1 Year Warranty",
    image: image1,
  },
  {
    brand: "Dell",
    badge: "25% off",
    tag: "Bestseller",
    title: "Refurbished Dell Latitude 5421 | i7-11th Gen",
    price: 59999,
    mrp: 80000,
    image: image2,
  },
  {
    brand: "HP",
    badge: "47% off",
    tag: "Rapid delivery",
    title: "Refurbished HP ProBook x360",
    price: 85999,
    mrp: 150000,
    image: image3,
  },
  {
    brand: "Dell",
    badge: "36% off",
    tag: "Design & styling",
    title: "Refurbished Dell G15",
    price: 56999,
    mrp: 90000,
    image: image4,
  },
  {
    brand: "Lenovo",
    badge: "28% off",
    tag: "Design & styling",
    title: "Refurbished Lenovo ThinkPad",
    price: 53999,
    mrp: 72000,
    image: image5,
  },
  {
    brand: "HP",
    badge: "29% off",
    title: "Refurbished HP ZBook Fury",
    price: 44999,
    mrp: 65000,
    warranty: "1 Year Warranty",
    image: image6,
  },
  {
    brand: "Dell",
    badge: "43% off",
    tag: "Bestseller",
    title: "Refurbished Dell G15 RTX",
    price: 95999,
    mrp: 180000,
    image: image7,
  },
  {
    brand: "Dell",
    badge: "47% off",
    tag: "Bestseller",
    title: "Refurbished Dell Latitude",
    price: 26999,
    mrp: 50000,
    image: image8,
  },
  {
    brand: "Apple",
    badge: "32% off",
    tag: "Design & styling",
    title: "Refurbished Apple MacBook Pro",
    price: 79999,
    mrp: 150000,
    warranty: "1 Year Warranty",
    image: image9,
  },
  {
    brand: "Apple",
    badge: "47% off",
    tag: "Design & styling",
    title: "Refurbished Apple MacBook Pro",
    price: 79999,
    mrp: 110000,
    warranty: "1 Year Warranty",
    image: image10,
  },
];

function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN") + ".00";
}

export default function CrazyRefurbished() {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <section className="w-full bg-white py-8">
      <div className="max-w-[93%] mx-auto px-6 md:px-8 lg:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
            CRAZY REFURBISHED DEALS
          </h1>
          <button className="hidden sm:inline-flex items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
            VIEW ALL
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filters.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(i)}
              className={`flex flex-col items-start rounded-md border px-4 py-2 min-w-[150px] text-left transition-colors ${activeFilter === i
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
            >
              <span className="text-xs font-semibold text-gray-900">
                {f.label}
              </span>
              <span className="text-[11px] text-gray-500">{f.sub}</span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p, idx) => {
            const discountPct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <div
                key={idx}
                className="flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
              >
                {/* Image */}
                <div className="relative bg-[#F5F5F5] h-[150px] flex items-center justify-center">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="max-w-[75%] max-h-[120px] object-contain"
                  />
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {p.badge}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 p-3">

                  {/* Brand + Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500">
                      {p.brand}
                    </span>

                    {p.tag && (
                      <span className="bg-[#FFE5E5] text-[#444] text-[8px] font-medium px-2 py-[2px] rounded">
                        {p.tag}
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <p className="text-xs text-gray-800 leading-snug line-clamp-3 mb-2 min-h-[54px]">
                    {p.title}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      {formatINR(p.price)}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatINR(p.mrp)}
                    </span>
                  </div>

                  {p.warranty ? (
                    <span className="text-[10px] text-green-600 font-medium mb-2">
                      ✓ {p.warranty}
                    </span>
                  ) : (
                    <span className="text-[10px] text-transparent mb-2">
                      placeholder
                    </span>
                  )}

                  <button className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded">
                    ADD TO CART
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}