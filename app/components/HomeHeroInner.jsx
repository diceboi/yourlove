"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { AnimatePresence, motion } from "framer-motion";
import HomeHeroItem from "./HomeHeroItem";

export default function HomeHeroInner() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay ]}
      spaceBetween={8}
      slidesPerView={1}
      navigation
      pagination={{
          clickable: true,
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop={true}
      className="w-full rounded-2xl overflow-hidden"
    >
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} description={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."} buttontype={"pink"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} subtitle={"Most kihagyhatatlan áron"} buttontype={"green"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} subtitle={"Most kihagyhatatlan áron"} buttontype={"cream-pink"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} subtitle={"Most kihagyhatatlan áron"} buttontype={"black"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} subtitle={"Most kihagyhatatlan áron"} buttontype={"white"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} subtitle={"Most kihagyhatatlan áron"} buttontype={"black-border"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
      <SwiperSlide>
        <HomeHeroItem title={"Akciós termékek"} titlescolor={"text-white"} subtitle={"Most kihagyhatatlan áron"} buttontype={"white-border"} buttontitle={"Érdekel"} buttonlink={"/"} bgimage={"/heroimages/hero1.webp"} bgimagealt={"hero1"} buttonicon={"TbArrowRight"} bgimageoverlay={"bg-[var(--black)]"} bgimageoverlayopacity={"opacity-10"} />
      </SwiperSlide>
    </Swiper>
  );
}
