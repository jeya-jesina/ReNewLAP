import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* LEFT */}
          <div>
            <h2 className="text-[42px] font-extrabold text-[#356BD8] tracking-tight">
              REnewLAP
            </h2>

            <p className="mt-4 text-[14px] leading-7 text-gray-600 max-w-[270px]">
              India's most trusted certified renewed laptop seller—
              professionally tested, securely wiped, warranty-backed,
              with fast delivery and responsive local support.
            </p>

            <h4 className="mt-10 text-[15px] font-bold uppercase text-black">
              STAY CONNECTED
            </h4>

            <div className="flex gap-4 mt-3 text-black text-lg">
              <FaFacebook className="cursor-pointer hover:text-blue-600 transition" />
              <FaInstagram className="cursor-pointer hover:text-pink-500 transition" />
              <FaYoutube className="cursor-pointer hover:text-red-600 transition" />
            </div>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h3 className="font-bold text-[15px] uppercase mb-5">
              QUICK LINKS
            </h3>

            <ul className="space-y-3 text-[14px] text-gray-600">
              <li><a href="#" className="hover:text-[#356BD8]">Macbook Second Hand Laptop</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Lenovo Second Hand Laptop</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Dell Second Hand Laptop</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">HP Second Hand Laptop</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Blogs</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">My Account</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Corporate</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Reviews</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Support</a></li>
            </ul>
          </div>

          {/* COMPANY */}

          <div>
            <h3 className="font-bold text-[15px] uppercase mb-5">
              COMPANY INFO
            </h3>

            <ul className="space-y-3 text-[14px] text-gray-600">
              <li><a href="#" className="hover:text-[#356BD8]">About Us</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-[#356BD8]">Shipping Policy</a></li>
            </ul>
          </div>

          {/* CONTACT */}

          <div>
            <h3 className="font-bold text-[15px] uppercase mb-5">
              CONTACT US
            </h3>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="mt-1 text-black" />
                <p className="text-[14px] leading-6 text-gray-600">
                  Office# 1110, 11th Floor, Star City Mall,
                  Abdullah Haroon Road, Saddar,
                  Chennai, Tamilnadu - 600053
                </p>
              </div>

              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-black" />
                <span className="text-[14px] text-gray-600">
                  +91 93899 03752
                </span>
              </div>

              <div className="flex items-center gap-4">
                <FaEnvelope className="text-black" />
                <a
                  href="mailto:sale@renewlap.in"
                  className="text-[14px] text-gray-600 hover:text-[#356BD8]"
                >
                  sale@renewlap.in
                </a>
              </div>

            </div>
          </div>

        </div>

        <div className="border-t border-gray-300 mt-14 pt-6">
          <p className="text-[13px] text-gray-500">
            © 2026 Renewlap. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;