import React from "react";
import BestSeller from "../components/BestSeller";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import PersonalizeProducts from "../components/PersonalizeProducts";


const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <PersonalizeProducts />
    </div>
  );
};

export default Home;
