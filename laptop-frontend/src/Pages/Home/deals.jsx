import React from "react";
import laptopImg from "../../assets/deals/laptop.png"; // change path if needed

const Deals = () => {
  return (
    <section className="w-full bg-[#f3f3f3] py-12 px-4">
      <div className="max-w-[91%] mx-auto bg-[#eff4fc] rounded-[32px] overflow-hidden shadow-sm">
        
        {/* TOP BAR: GRADIENT HEADER SECTION */}
        <div className="bg-gradient-to-r from-[#f7cbb1] to-[#ff7a7a] px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-[26px] font-black text-[#1c1c1c] tracking-tight leading-tight">
              DEAL OF THE DAY
            </h2>
            <p className="text-[12px] text-[#2c2c2c] font-medium mt-0.5">
              Handpicked daily — the deepest discount and biggest savings on a flagship pick.
            </p>
          </div>
          
          {/* TIMER */}
          <div className="text-white font-black text-[28px] tracking-widest leading-none sm:pr-2">
            02H : 36M : 27S
          </div>
        </div>

        {/* CONTENT CARD WRAPPER */}
        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* LEFT IMAGE DISPLAY CONTAINER */}
          <div className="md:col-span-6 flex justify-center items-center">
            <div className="w-full max-w-[440px]">
              <img
                src={laptopImg}
                alt="MacBook Pro"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* RIGHT SIDE DATA INFRASTRUCTURE */}
          <div className="md:col-span-6 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#7a7a7a] uppercase mb-1">
              APPLE
            </span>

            <h3 className="text-[22px] lg:text-[25px] font-black text-[#1a1a1a] leading-[1.25] tracking-tight">
              Refurbished | Apple MacBook Pro A2485 | M1 Pro | 16" FHD Retina Display
            </h3>

            {/* LIVE IN-STOCK AND METRICS DATA BLOCK */}
            <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#28a745]"></span>
              <span className="text-[#6c6c6c]">IN STOCK —</span>
              <span className="text-[#dc3545]">ONLY 5 LEFT</span>
            </div>

            {/* CURRENCY PRICING MATRIX ROW */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-[28px] font-black text-[#1c1c1c] tracking-tight">
                ₹79,999.00
              </span>
              <span className="text-[16px] text-[#ababab] line-through font-semibold">
                ₹1,50,000
              </span>
            </div>

            {/* OFFERS OR SAVINGS HIGHLIGHT BOX */}
            <div className="mt-2.5 self-start bg-[#2b6be2] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-[4px] tracking-wide">
              SAVE ₹70,001 (47% OFF)
            </div>

            {/* INTERACTION ACTION BUTTONS ZONE */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="h-[46px] px-8 rounded-full bg-[#2b6be2] text-white font-extrabold text-[13px] hover:bg-[#1f56be] transition shadow-sm tracking-wide">
                ADD CART
              </button>

              <button className="h-[46px] px-7 rounded-full border border-[#d2d2d2] text-[#555] font-extrabold text-[13px] bg-[#f8f9fa] hover:bg-[#ececec] transition tracking-wide">
                VIEW DETAILS
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Deals;