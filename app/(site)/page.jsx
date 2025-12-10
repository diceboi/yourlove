import HomeHero from "../components/HomeHero";
import Benefits from "../components/Benefits";
import PopularProducts from "../components/PopularProducts";
import MainCta from "../components/MainCta";
import NewProducts from "../components/NewProductList";
import PopularCategories from "../components/PopularCategories";
import SaleProducts from "../components/SaleProducts";
import LatestBlogs from "../components/LatestBlogs";
import WhyBuyHere from "../components/WhyBuyHere";
import ClubMembership from "../components/ClubMembership";
import Reviews from "../components/Reviews";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Benefits />
      <PopularCategories />
      <PopularProducts />
      <SaleProducts />
      <div className="py-16 px-4 xl:px-12 ">
        <MainCta />
      </div>
      <NewProducts />
      <ClubMembership />
      <WhyBuyHere />
      <Reviews />
      <LatestBlogs />
    </>
  );
}