import React from 'react';

const NavigationBar = () => {
  return (
    <nav className="flex flex-wrap items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-200">
      {/* Left section: Logo / Brand */}
      <div className="flex items-center space-x-1">
        <span className="text-2xl font-bold text-gray-800 tracking-tight">RNewLAP</span>
        <span className="text-xs font-medium text-gray-400 ml-1">®</span>
      </div>

      {/* Center section: Filters + Search (hidden on small screens, shown on md+) */}
      <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-700">
        {/* Brands dropdown */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors">
          <span>Brands</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Budget dropdown */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors">
          <span>Budget</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Profession dropdown */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors">
          <span>Profession</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for anything"
            className="w-64 pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-2.5 text-gray-400"
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
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
          <span className="flex items-center gap-1 cursor-pointer">Brands ▼</span>
          <span className="flex items-center gap-1 cursor-pointer">Budget ▼</span>
          <span className="flex items-center gap-1 cursor-pointer">Profession ▼</span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for anything"
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-2.5 text-gray-400"
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

export default NavigationBar;