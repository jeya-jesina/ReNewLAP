import React from "react";

const Header = () => {
  return (
    <nav className="w-full h-16 bg-[#3271D7] flex items-center justify-between px-[72px] select-none">

      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <h1 className="text-white text-[24px] font-bold tracking-[-0.5px]">
          REnewLAP
        </h1>
      </div>

      {/* Center */}
      <div className="flex items-center gap-10 flex-1 justify-center">

        {/* Brands */}
        <button className="flex items-center gap-1 text-white text-[16px] font-medium hover:opacity-90">
          <span>By Brands</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Budget */}
        <button className="flex items-center gap-1 text-white text-[16px] font-medium hover:opacity-90">
          <span>By Budget</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Profession */}
        <button className="flex items-center gap-1 text-white text-[16px] font-medium hover:opacity-90">
          <span>By Profession</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Search */}
        <div className="relative ml-8">
          <input
            type="text"
            placeholder="Search for anything"
            className="
              w-[355px]
              h-[36px]
              bg-white
              border
              border-[#D9D9D9]
              rounded-md
              pl-11
              pr-4
              text-[15px]
              text-[#333333]
              placeholder:text-[#8A8A8A]
              outline-none
              focus:border-[#D9D9D9]
              focus:ring-0
            "
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
          </svg>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-8 ml-10">

        {/* Cart */}
        <button className="text-white hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </button>

        {/* Wishlist */}
        <button className="text-white hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
        </button>

        {/* Profile */}
<button className="text-white hover:opacity-80 transition">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    {/* Outer Circle */}
    <circle cx="12" cy="12" r="10" />

    {/* Head */}
    <circle cx="12" cy="9" r="2.6" />

    {/* Shoulders */}
    <path
      d="M6.6 18c.8-2.5 3-3.8 5.4-3.8s4.6 1.3 5.4 3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>

      </div>
    </nav>
  );
};

export default Header;