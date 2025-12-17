"use client";

import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { createClient } from "@/utils/supabase/client";
import HomeHeroItem from "./HomeHeroItem";

export default function HomeHeroInner() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('published', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        setSlides(data || []);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, [supabase]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-gray-200 animate-pulse xl:h-[70vh] h-[60vh]" />
    );
  }

  // Fallback if no slides
  if (slides.length === 0) {
    return (
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        spaceBetween={8}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="w-full rounded-2xl overflow-hidden"
      >
        <SwiperSlide>
          <HomeHeroItem
            title={"Üdvözlünk!"}
            titlescolor={"text-white"}
            description={"Fedezd fel kínálatunkat"}
            buttontype={"pink"}
            buttontitle={"Érdekel"}
            buttonlink={"/"}
            bgimage={"/heroimages/hero1.webp"}
            bgimagealt={"hero"}
            buttonicon={"TbArrowRight"}
            bgimageoverlay={"bg-[var(--black)]"}
            bgimageoverlayopacity={"opacity-10"}
          />
        </SwiperSlide>
      </Swiper>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      spaceBetween={8}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      preventClicks={false}
      preventClicksPropagation={false}
      allowTouchMove={true}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      className="w-full rounded-2xl overflow-hidden"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <HomeHeroItem
            title={slide.title}
            titlescolor={slide.title_color}
            subtitle={slide.subtitle}
            description={slide.description}
            buttontype={slide.button_type}
            buttontitle={slide.button_title}
            buttonlink={slide.button_link}
            bgimage={slide.bg_image}
            bgimagealt={slide.bg_image_alt}
            buttonicon={slide.button_icon}
            bgimageoverlay={slide.bg_overlay_color}
            bgimageoverlayopacity={slide.bg_overlay_opacity}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
