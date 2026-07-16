import React from "react";
import Banner from "./banner";
import LaptopDeals from "./offer";
import BudgerRefurbished from "./budgerRefurbished";
import CrazyRefurbished from "./crazyRefurbished";
import Deals from "./deals";
import Customer from "./customer";
import Clients from "./clients";
import Enquire from "./enquire";


export default function Home() {
  return (
    <>
      <Banner />
      <Deals />
      <BudgerRefurbished />
      <LaptopDeals />
      <CrazyRefurbished />
      <Customer />
      <Clients />
      <Enquire />
    </>
  );
}