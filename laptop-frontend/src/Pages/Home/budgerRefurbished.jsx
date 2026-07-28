
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
  {
    label: "BASIC USERS",
    sub: "UNDER ₹20K",
  },
  {
    label: "PROGRAMMERS",
    sub: "₹20K – ₹50K",
  },
  {
    label: "POWER USERS",
    sub: "₹50K – ₹90K",
  },
  {
    label: "PRO MODELS",
    sub: "ABOVE ₹90K",
  },
];
const products = [
  {
    brand: "Dell",
    badge: "47% OFF",
    tag: "Bestseller",
    title: "Refurbished | Dell Latitude 5400 | 8GB DDR4 | 11th Gen Intel Core i7 | 256GB SSD",
    price: 32499,
    mrp: 51000,
    warranty: "1 Year Warranty",
    image: image1,
  },
  {
    brand: "Lenovo",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished Lenovo ThinkPad T14 | Ryzen 5 Pro | 16GB RAM",
    price: 39990,
    mrp: 55000,
    warranty: "1 Year Warranty",
    image: image2,
  },
  {
    brand: "Apple",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished Dell Chrome Book 3120 | Intel Celeron | 4GB RAM",
    price: 11699,
    mrp: 35000,
    warranty: "1 Year Warranty",
    image: image3,
  },
  {
    brand: "HP",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished HP ProBook x360 | Ryzen 7 | 16GB DDR4 | 512GB SSD",
    price: 37499,
    mrp: 58900,
    warranty: "1 Year Warranty",
    image: image4,
  },
  {
    brand: "Dell",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished Dell Latitude 5401 | Intel Core i5-9th Gen | 16GB DDR4 RAM",
    price: 29799,
    mrp: 43000,
    warranty: "1 Year Warranty",
    image: image5,
  },
  {
    brand: "HP",
    badge: "57% OFF",
    tag: "Design & Listing",
    title: "Refurbished HP EliteBook 845G8 | Ryzen 5 Pro 5650U | 16GB DDR4",
    price: 32999,
    mrp: 78000,
    warranty: "1 Year Warranty",
    image: image6,
  },
  {
    brand: "Lenovo",
    badge: "53% OFF",
    tag: "Design & Listing",
    title: "Refurbished Lenovo ThinkPad T13 | Ryzen 5 Pro | 8GB DDR4 | 256GB SSD",
    price: 24990,
    mrp: 56000,
    warranty: "1 Year Warranty",
    image: image7,
  },
  {
    brand: "Apple",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished Dell Latitude 3420 | Intel i5-11th Gen | 8GB RAM",
    price: 28499,
    mrp: 48300,
    warranty: "1 Year Warranty",
    image: image8,
  },
  {
    brand: "Apple",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished Lenovo ThinkPad T14 | Ryzen 5 Pro | 8GB DDR4",
    price: 25999,
    mrp: 35000,
    warranty: "1 Year Warranty",
    image: image9,
  },
  {
    brand: "Apple",
    badge: "47% OFF",
    tag: "Design & Listing",
    title: "Refurbished HP ProBook x360 435G8 | Ryzen 7 | 16GB RAM | 512GB SSD",
    price: 27199,
    mrp: 53000,
    warranty: "1 Year Warranty",
    image: image10,
  },
];

function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN") + ".00";
}

export default function BudgerRefurbished() {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
  <section className="w-full bg-white py-8">
      <div className="max-w-[93%] mx-auto px-6 md:px-8 lg:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
          BUDGER REFURBISHED DEALS
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
            className={`flex flex-col items-start rounded-md border px-4 py-2 min-w-[150px] text-left transition-colors ${
              activeFilter === i
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
              <div className="relative bg-gray-100 aspect-square">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {p.badge}
                </span>
                {p.tag && (
                  <span className="absolute bottom-0 left-0 bg-gray-900/80 text-white text-[9px] px-2 py-1">
                    {p.tag}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col flex-1 p-3">
                <span className="text-[11px] font-semibold text-gray-500 mb-1">
                  {p.brand}
                </span>
                <p className="text-xs text-gray-800 leading-snug line-clamp-2 mb-2 h-8">
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