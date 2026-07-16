import React from 'react';

const Deals = () => {
  return (
    <div 
      className="relative mx-auto overflow-hidden"
      style={{
        width: '1286px',
        height: '559px',
        borderRadius: '50px',
        background: 'linear-gradient(96.59deg, #F5CBA7 1.96%, #FF7F7F 95.39%)',
      }}
    >
      <div className="flex h-full">
        {/* Left Content Section */}
        <div className="flex-1 px-12 py-10 flex flex-col justify-between">
          {/* Top Section */}
          <div>
            {/* Deal of the Day Badge */}
            <div className="inline-block bg-red-600 text-white px-6 py-1.5 rounded-full text-sm font-bold mb-3">
              DEAL OF THE DAY
            </div>
            
            {/* Description */}
            <p className="text-white text-sm font-medium max-w-md leading-relaxed">
              Handpicked daily — the deepest discount and biggest savings on a flagship pick.
            </p>
          </div>

          {/* Timer Section */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-3xl font-bold tracking-wider">02H</span>
            <span className="text-white text-2xl font-bold">:</span>
            <span className="text-white text-3xl font-bold tracking-wider">36M</span>
            <span className="text-white text-2xl font-bold">:</span>
            <span className="text-white text-3xl font-bold tracking-wider">27S</span>
          </div>

          {/* Product Details */}
          <div className="space-y-1">
            {/* Brand */}
            <div className="text-white font-bold text-sm tracking-wider">APPLE</div>
            
            {/* Product Title */}
            <h3 className="text-white font-bold text-lg leading-tight max-w-md">
              Refurbished | Apple MacBook Pro A2485 | M1 Pro | 16" FHD Retina Display
            </h3>
            
            {/* Stock Status */}
            <div className="text-white text-sm font-semibold flex items-center">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              IN STOCK — ONLY 5 LEFT
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center space-x-3">
            <span className="text-white text-3xl font-bold">₹79,999.00</span>
            <span className="text-white/70 text-xl line-through">₹1,50,000</span>
            <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              SAVE ₹70,001 (47% OFF)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button className="bg-white text-gray-800 font-bold px-8 py-2.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
              ADD CART
            </button>
            <button className="bg-transparent border-2 border-white text-white font-bold px-8 py-2.5 rounded-full hover:bg-white/10 transition-colors">
              VIEW DETAILS
            </button>
          </div>
        </div>

        {/* Right Section - Laptop Image */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Decorative circle behind laptop */}
          <div className="absolute w-80 h-80 bg-white/20 rounded-full blur-2xl"></div>
          
          {/* Laptop Image */}
          <img 
            src="/src/assets/deals/laptop.png" 
            alt="Apple MacBook Pro"
            className="relative z-10 object-contain"
            style={{
              width: '400px',
              height: '300px',
            }}
          />
          
          {/* Decorative floating elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Deals;