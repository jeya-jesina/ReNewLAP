import React from "react";

const Customer = () => {
  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#3E73D3] rounded-sm py-16 px-6 text-center">

          {/* Heading */}
          <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight">
            Exclusive Bulk Rates
            <br />
            for Corporates & Resellers!
          </h2>

          {/* Description */}
          <p className="text-white text-sm md:text-base mt-5 max-w-3xl mx-auto leading-relaxed font-normal">
            Special Pricing for Corporates & Resellers! Get Exclusive Bulk
            Discounts on Refurbished Laptops.
            <br />
            Imported Premium Quality, Lowest Price Guarantee, After-Sales
            Support.
          </p>

          {/* Button */}
          <button className="mt-8 bg-white text-[#3E73D3] font-semibold text-sm px-8 py-3 rounded-full hover:bg-gray-100 transition duration-300 shadow-md">
            ENQUIRE NOW
          </button>

        </div>
      </div>
    </section>
  );
};

export default Customer;