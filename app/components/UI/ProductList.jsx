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

export default function ProductList({slidesPerView640, slidesPerView768, slidesPerView1024, slidesPerView1280}) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      spaceBetween={0}
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
      }}
      className="w-full border-l border-t border-[var(--border)]"
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
