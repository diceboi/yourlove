"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { AnimatePresence, motion } from "framer-motion";
import ProductListItem from "./ProductListItem";

export default function ProductList({products = [], slidesPerView640, slidesPerView768, slidesPerView1024, slidesPerView1280, slidesPerView1440}) {

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      spaceBetween={16}
      slidesPerView={slidesPerView640}
      navigation
      pagination={{
        clickable: true,
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      breakpoints={{
        640: {
          slidesPerView: slidesPerView640,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: slidesPerView768,
          spaceBetween: 0,
        },
        1024: {
          slidesPerView: slidesPerView1024,
          spaceBetween: 0,
        },
        1280: {
          slidesPerView: slidesPerView1280,
          spaceBetween: 0,
        },
        1440: {
          slidesPerView: slidesPerView1440,
          spaceBetween: 0,
        },
      }}
      className="w-full"
    >
      {products.map((product) => (
        <SwiperSlide key={product.id || product.cikkszam} className="py-4 px-2">
          <ProductListItem
            id={product.id}
            image={product.termekkep}
            focim={product.fo_cim}
            price={product.eladasi_ar_brutto}
            stock={product.keszlet}
            slug={product.seo_slug}
            category={product.kategoria}
            // Add other props if needed
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
