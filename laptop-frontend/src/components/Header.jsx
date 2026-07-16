import React from 'react';

const Header = () => {
  return (
    <nav className="flex items-center justify-between px-8 bg-[#3271D7] w-full z-50 select-none" style={{ height: '64px' }}>
      {/* Left section: Logo */}
      <div className="flex items-center">
        <span className="text-2xl font-bold text-white tracking-tight">REnewLAP</span>
      </div>

      {/* Center section: Navigation & Search */}
      <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-white flex-1 justify-center max-w-3xl mx-auto">
        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <span>By Brands</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <span>By Budget</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <span>By Profession</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search for anything"
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-white/20 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-2.5 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Right section: Profile/Cart Icons from Figma */}
      <div className="flex items-center space-x-4 text-white">
        <button className="hover:text-blue-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
        <button className="hover:text-blue-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button className="hover:text-blue-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Header;