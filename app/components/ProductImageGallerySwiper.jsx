"use client";

import { useState } from "react";
import Image from "next/image";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode, Mousewheel, Navigation, Zoom } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import "swiper/css/zoom";

export default function ProductImageGallerySwiper({
  images = [],
  alt = "Termék kép",
}) {
  const validImages = images.filter(Boolean);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!validImages.length) return null;

  const thumbsModules = [Thumbs, FreeMode, Mousewheel, Navigation];
  const mainModules = [Thumbs, Zoom, Navigation];

  return (
    <>
      {/* FŐ GALÉRIA BLOKK */}
      <div className="flex lg:flex-row flex-col-reverse gap-4 w-full">
        {/* BAL: THUMBS */}
        <div className="lg:w-24 w-full">
          <div className="relative lg:h-[70vh] h-20">
            {/* fel/le nyilak a thumb swiperhez */}
            <button
              type="button"
              className="thumbs-prev absolute -top-2 left-1/2 -translate-x-1/2 z-20 bg-[var(--green)] cursor-pointer rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-sm hidden lg:flex"
            >
              <TbChevronUp />
            </button>
            <button
              type="button"
              className="thumbs-next absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 bg-[var(--green)] cursor-pointer rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-sm hidden lg:flex"
            >
              <TbChevronDown />
            </button>
            <div className="absolute bottom-0 lg:left-0 -right-1 w-20 h-20 lg:bg-gradient-to-t from-white to-transparent bg-gradient-to-l z-10 pointer-events-none">

            </div>

            <Swiper
              onSwiper={setThumbsSwiper}
              direction="vertical"
              slidesPerView={6}
              spaceBetween={2}
              freeMode
              mousewheel
              watchSlidesProgress
              modules={thumbsModules}
              navigation={{
                prevEl: ".thumbs-prev",
                nextEl: ".thumbs-next",
              }}
              className="h-full"
              breakpoints={{
                // mobilon legyen inkább vízszintes thumb sor
                0: {
                  direction: "horizontal",
                  slidesPerView: 4.5,
                  mousewheel: false,
                },
                1024: {
                  direction: "vertical",
                  slidesPerView: 5.5,
                  mousewheel: true,
                },
              }}
            >
              {validImages.map((src, idx) => (
                <SwiperSlide
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => {
                    if (mainSwiper) {
                      mainSwiper.slideTo(idx); // nagy swiper léptetése
                      setActiveIndex(idx); // border kiemelés
                    }
                  }}
                >
                  <div
                    className={`
                      relative mx-auto border rounded-md overflow-hidden
                      lg:w-20 lg:h-20 w-16 h-16
                      ${
                        idx === activeIndex
                          ? "border-[var(--pink)]"
                          : "border-[var(--border)]"
                      }
                    `}
                  >
                    <Image
                      src={src}
                      alt={`${alt} - ${idx + 1}. kép`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* JOBB: FŐ KÉP SWIPER + ZOOM */}
        <div className="relative w-full lg:w-[calc(100%-96px)] lg:h-[70vh] h-[40vh]">
          <Swiper
            modules={mainModules}
            zoom
            spaceBetween={10}
            navigation
            onSwiper={setMainSwiper}
            thumbs={
              thumbsSwiper && !thumbsSwiper.destroyed
                ? { swiper: thumbsSwiper }
                : undefined
            }
            onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
            initialSlide={activeIndex}
            className="w-full h-full"
          >
            {validImages.map((src, idx) => (
              <SwiperSlide key={idx}>
                <div
                  className="swiper-zoom-container relative w-full h-full bg-white overflow-hidden"
                  onClick={() => setLightboxOpen(true)} // kattintásra full-screen
                >
                  <Image
                    src={src}
                    alt={`${alt} - ${idx + 1}. kép`}
                    fill
                    className="object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* kis "Nagyítás" gomb a sarokban */}
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 bg-black/90 text-xs px-3 py-1 rounded-full border border-[var(--border)] shadow-sm hover:bg-[var(--grey-bg)]"
          >
            Nagyítás
          </button>
        </div>
      </div>

      {/* FULL-SCREEN LIGHTBOX SWIPER + ZOOM */}
      {lightboxOpen && (
        <div
            className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}      // ← háttérre kattint: zár
        >
            {/* Ne buborékoljon tovább a kép körüli területről! */}
            <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto"
            onClick={(e) => e.stopPropagation()}      // ← a képre katt: ne zárjon
            >
            <button
                type="button"
                className="absolute top-4 right-4 text-white text-2xl cursor-pointer z-50"
                onClick={() => setLightboxOpen(false)}
            >
                ✕
            </button>

            <Swiper
                modules={[Zoom, Navigation]}
                zoom
                navigation
                spaceBetween={10}
                initialSlide={activeIndex}
                className="w-full h-full"
            >
                {validImages.map((src, idx) => (
                <SwiperSlide key={idx}>
                    <div className="swiper-zoom-container relative w-full h-full">
                    <Image
                        src={src}
                        alt={`${alt} - nagyított ${idx + 1}. kép`}
                        fill
                        className="object-contain"
                    />
                    </div>
                </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </div>
      )}

    </>
  );
}
