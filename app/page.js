import HomeHero from "./components/HomeHero"
import Benefits from "./components/Benefits"
import PopularProducts from "./components/PopularProducts"
import MainCta from "./components/MainCta"
import NewProducts from "./components/NewProductList"

export default function HomePage() {
  return (
    <>
    <HomeHero />
    <Benefits />
    <PopularProducts />
    <MainCta />
    <NewProducts />
    </>
  )
}
