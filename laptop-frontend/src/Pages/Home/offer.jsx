import React from "react";

import img1 from "../../assets/offer/img1.png";
import img2 from "../../assets/offer/img2.png";
import img3 from "../../assets/offer/img3.png";
import img4 from "../../assets/offer/img4.png";
const cards = [
  {
    bg: "#B2EDD5",
    title: "Macbook With M3 Chip",
    offer: "Up to 40% OFF",
    image: img1,
  },
  {
    bg: "#FFC2D1",
    title: "Premium Laptop",
    offer: "Up to 50% OFF",
    image: img2,
  },
  {
    bg: "#D8CFFF",
    title: "OG Gaming Laptop",
    offer: "Up to 50% OFF",
    image: img3,
  },
  {
    bg: "#F7E4C9",
    title: "2 in 1 Laptop",
    offer: "Up to 50% OFF",
    image: img4,
  },
];

export default function LaptopDeals() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ backgroundColor: "#E1EDFF" }}
    >      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              style={{ backgroundColor: card.bg }}
className="p-8 flex flex-col justify-between min-h-[420px] hover:shadow-lg transition-shadow duration-300">
              <div>
                <h3
                  className="text-xl font-semibold leading-snug"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#181818",
                  }}
                >
                  {card.title}
                </h3>

                <p
                  className="text-sm mt-2 text-[#3271D7]"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: "#181818",
                  }}
                >
                  {card.offer}
                </p>

                <a
                  href="#"
                  className="inline-block text-sm font-medium text-[#3271D7] underline underline-offset-2 mt-2 hover:opacity-80"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Shop Now
                </a>
              </div>

              <div className="mt-6 flex justify-center">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full max-w-[180px] object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}