import React from "react";

import newgen from "../../assets/clients/logo1.png";
import hybridplus from "../../assets/clients/logo2.png";
import technet from "../../assets/clients/logo3.png";
import sigma from "../../assets/clients/logo4.png";
import tibco from "../../assets/clients/logo5.png";

const logos = [
  newgen,
  hybridplus,
  technet,
  sigma,
  tibco,
];

const Clients = () => {
  return (
    <section className="w-full bg-white py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <h2 className="text-[34px] font-extrabold text-[#222] uppercase mb-10">
          OUR VALUABLE CLIENTS
        </h2>

        {/* Auto Scroll */}
        <div className="relative overflow-hidden">

          <div className="flex animate-client-scroll">

            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[220px] flex items-center justify-center"
              >
                <img
                  src={logo}
                  alt="Client Logo"
                  className="h-16 object-contain transition duration-300 hover:scale-105"
                />
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
};

export default Clients;