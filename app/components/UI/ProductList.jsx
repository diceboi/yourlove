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

export default function ProductList() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      spaceBetween={8}
      slidesPerView={2}
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
        768: {
          slidesPerView: 2,
          spaceBetween: 8,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 8,
        },
        1280: {
          slidesPerView: 4,
          spaceBetween: 8,
        },
      }}
      className="w-full rounded-2xl overflow-hidden"
    >
      <SwiperSlide>
        <ProductListItem />
      </SwiperSlide>
      <SwiperSlide>
        <ProductListItem />
      </SwiperSlide>
      <SwiperSlide>
        <ProductListItem />
      </SwiperSlide>
      <SwiperSlide>
        <ProductListItem />
      </SwiperSlide>
      <SwiperSlide>
        <ProductListItem />
      </SwiperSlide>
    </Swiper>
  );
}
