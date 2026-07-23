import React from "react";
import Banner from "./banner";
import LaptopDeals from "./offer";
import Deals from "./deals";
import Customer from "./customer";
import Clients from "./clients";
import Enquire from "./enquire";
import CrazyRefurbished from "./crazyRefurbished";
import BudgerRefurbished from "./budgerRefurbished";


export default function Home() {
  return (
    <>
      <Banner />
      <Deals />
      <CrazyRefurbished/>
      <LaptopDeals />
      <BudgerRefurbished/>
      <Customer />
      <Clients />
      <Enquire />
    </>
  );
}