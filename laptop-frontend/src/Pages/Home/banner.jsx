import React from 'react'
import bannerHeroImage from '../../assets/home/banner.png'
import acer from '../../assets/home/acer.png'
import apple from '../../assets/home/apple.png'
import dell from '../../assets/home/dell.png'
import lenovo from '../../assets/home/lenovo.png'
import hp from '../../assets/home/hp.png'
import asus from '../../assets/home/asus.png'

export default function Banner() {
  return (
    <section className="w-full bg-[#2F6FE4] py-2">
      <div className="max-w-[1440px] mx-auto px-5">

        {/* Banner */}
       <div className="relative overflow-hidden flex justify-center">

  <img
    src={bannerHeroImage}
    alt="Banner"
    className="w-[91%] h-[260px] sm:h-[340px] md:h-[420px] lg:h-[470px] xl:h-[500px] object-cover object-center"
  />

  <div className="absolute inset-0 w-[90%] mx-auto flex items-center">

            <div className="pl-6 sm:pl-10 md:pl-14 lg:pl-16 max-w-[760px]">

              <h1 className="font-extrabold text-white leading-[1.08]
              text-[30px]
              sm:text-[42px]
              md:text-[58px]
              lg:text-[66px]">

                Refurbished. Reliable.
                <br />
                Ready For Anything.

              </h1>

              <p className="mt-5 max-w-[560px]
              text-white
              text-[13px]
              md:text-[18px]
              leading-relaxed">

                Top brands. Fully tested. Ready to perform—
                at up to{" "}
                <span className="font-bold">
                  70% less than new.
                </span>

              </p>

              <button className="mt-8 bg-[#3B82F6] hover:bg-[#2563EB]
              text-white
              font-semibold
              rounded-full
              px-10
              py-3
              transition">

                BUY NOW

              </button>

            </div>

          </div>

        </div>

        {/* Logos */}

      {/* Brand Logos */}
<div className="bg-[#2F6FE4] py-5">
  <div className="grid grid-cols-3 md:grid-cols-6 items-center justify-items-center gap-y-6">

    <img
      src={acer}
      alt="Acer"
      className="h-10 md:h-12 lg:h-14 object-contain transition duration-300 hover:scale-105"
    />

    <img
      src={apple}
      alt="Apple"
      className="h-12 md:h-14 lg:h-16 object-contain transition duration-300 hover:scale-105"
    />

    <img
      src={dell}
      alt="Dell"
      className="h-10 md:h-12 lg:h-14 object-contain transition duration-300 hover:scale-105"
    />

    <img
      src={lenovo}
      alt="Lenovo"
      className="h-8 md:h-10 lg:h-12 object-contain transition duration-300 hover:scale-105"
    />

    <img
      src={hp}
      alt="HP"
      className="h-12 md:h-14 lg:h-16 object-contain transition duration-300 hover:scale-105"
    />

    <img
      src={asus}
      alt="ASUS"
      className="h-10 md:h-12 lg:h-14 object-contain transition duration-300 hover:scale-105"
    />

  </div>
</div>

      </div>
    </section>
  );
};
