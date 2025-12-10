import HomeHero from "../components/HomeHero";
import Benefits from "../components/Benefits";
import PopularProducts from "../components/PopularProducts";
import MainCta from "../components/MainCta";
import NewProducts from "../components/NewProductList";
import PopularCategories from "../components/PopularCategories";
import SaleProducts from "../components/SaleProducts";
import LatestBlogs from "../components/LatestBlogs";
import WhyBuyHere from "../components/WhyBuyHere";
import Reviews from "../components/Reviews";
import MainCategories from "../components/MainCategories";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Benefits />
      <MainCategories />
      <PopularProducts />
      <SaleProducts />
      <PopularCategories />
      <div className="px-4 xl:px-12 ">
        <MainCta />
      </div>
      <NewProducts />
      <WhyBuyHere />
      <Reviews />
      <LatestBlogs />
    </>
  );
}