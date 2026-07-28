import React from "react";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Sumit Saxena",
    text: "Highly recommended for people searching for quality laptops in affordable prices and with warranty",
  },
  {
    name: "Sumit Saxena",
    text: "Highly recommended for people searching for quality laptops in affordable prices and with warranty",
  },
  {
    name: "Sumit Saxena",
    text: "Highly recommended for people searching for quality laptops in affordable prices and with warranty",
  },
  {
    name: "Sumit Saxena",
    text: "Highly recommended for people searching for quality laptops in affordable prices and with warranty",
  },
];

const Enquire = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="w-[92%] max-w-[1450px] mx-auto">

        {/* Heading */}
        <h2 className="text-[38px] font-extrabold uppercase text-black mb-8 tracking-tight">
          WHAT OUR CUSTOMERS SAYS
        </h2>

        {/* Main Box */}
        <div className="bg-[#E8F0FF] border border-[#C7D8FF] px-10 py-10">

          {/* Top */}
          <div className="flex justify-between items-center mb-10">

            {/* Rating */}
            <div className="flex items-center gap-6">

              <div className="text-center">
                <h3 className="text-5xl font-bold text-[#222] leading-none">
                  4.6
                </h3>

                <div className="flex justify-center mt-2">
                  <span className="text-[#4285F4] font-bold text-sm">G</span>
                  <span className="text-[#EA4335] font-bold text-sm">o</span>
                  <span className="text-[#FBBC05] font-bold text-sm">o</span>
                  <span className="text-[#4285F4] font-bold text-sm">g</span>
                  <span className="text-[#34A853] font-bold text-sm">l</span>
                  <span className="text-[#EA4335] font-bold text-sm">e</span>
                </div>
              </div>

              <div>
                <div className="flex text-[#F4B400] mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill="#F4B400"
                      strokeWidth={0}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-700">
                  Based on <strong>560 reviews</strong>
                </p>
              </div>
            </div>

            {/* Button */}
            <button className="bg-white text-[#3E73D3] text-sm font-semibold px-8 py-3 rounded-full shadow hover:bg-gray-100 transition">
              REVIEW NOW
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {reviews.map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 shadow-sm border border-gray-100 h-[270px] flex flex-col justify-between"
              >

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                      S
                    </div>

                    <div>
                      <h3 className="font-semibold text-[15px]">
                        {item.name}
                      </h3>

                      <div className="flex text-[#F4B400]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill="#F4B400"
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                    </div>

                  </div>

                  <p className="text-[13px] text-gray-700 mt-5 leading-6">
                    {item.text}
                  </p>

                </div>

                <div className="flex justify-between items-center mt-6">
                  <a
                    href="#"
                    className="text-gray-500 text-xs underline hover:text-blue-600"
                  >
                    Read more...
                  </a>

                  <span className="text-lg font-bold">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>

              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};

export default Enquire;