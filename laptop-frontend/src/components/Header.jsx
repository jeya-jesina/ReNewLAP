import React from 'react';

const Header = () => {
  return (
    <nav className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#3271D7] shadow-sm w-full" style={{ height: '80px' }}>
      {/* Left section: Logo / Brand */}
      <div className="flex items-center space-x-1">
        <span className="text-2xl font-bold text-white tracking-tight">REnewLAP</span>
      </div>

      {/* Center section: Filters + Search (hidden on small screens, shown on md+) */}
      <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-white">
        {/* Brands dropdown */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <span>By Brands</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Budget dropdown */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <span>By Budget</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Profession dropdown */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-100 transition-colors">
          <span>By Profession</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for anything"
            className="w-64 pl-9 pr-4 py-1.5 text-sm border border-white/30 rounded-full bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
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

      {/* Right section: optional actions (empty, but keep for symmetry) */}
      <div className="flex items-center space-x-2">
        {/* You can add icons/buttons here if needed */}
      </div>

      {/* Mobile toggle: show filters and search in a collapsible row below (optional) */}
      <div className="w-full md:hidden mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white">
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-100 transition-colors">By Brands ▼</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-100 transition-colors">By Budget ▼</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-100 transition-colors">By Profession ▼</span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for anything"
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-white/30 rounded-full bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
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
    </nav>
  );
};

export default Header;