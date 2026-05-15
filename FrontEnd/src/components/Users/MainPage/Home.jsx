import { useState, useEffect } from "react";
import { getMainPage } from "../../../Services/api";
import AboutUs from "./AboutUs/AboutUs";
import Hero from "./Banner/Hero";
import BestProduct from "./BestProduct/BestProduct";
import Bestsellers from "./Bestsellers/Bestsellers";
import Category from "./Category/Category";

const Home = () => {
  const [mainPageData, setMainPageData] = useState(null);

  useEffect(() => {
    const fetchMainPageData = async () => {
      try {
        const response = await getMainPage();
        if (response.data) {
          setMainPageData(response.data);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error("Failed to load Main Page data:", error);
        }
      }
    };
    fetchMainPageData();
  }, []);

  return (
    <>
      <Hero heroData={mainPageData} />
      <Category collectionsData={mainPageData} />
      <BestProduct />
      <Bestsellers offerData={mainPageData} />
      <AboutUs aboutData={mainPageData} />
    </>
  );
};

export default Home;
