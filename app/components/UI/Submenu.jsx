"use client";

import SubmenuItem from "./SubmenuItem";
import { useContext } from "react";
import { MenuContext } from "@/app/MenuContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { AnimatePresence, motion } from "framer-motion";

export default function Submenu() {
  const { subMenu, cancelCloseSubmenu, scheduleCloseSubmenu } =
    useContext(MenuContext);

  return (
    <AnimatePresence mode="wait">
      {subMenu && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={scheduleCloseSubmenu}
        >
          {subMenu === "ferfiaknak" && (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={16}
              slidesPerView={10}
              navigation
              className="w-full" // opcionális belső padding
              breakpoints={{
                0: { slidesPerView: 2.5, spaceBetween: 8 },
                640: { slidesPerView: 4, spaceBetween: 12 },
                1024: { slidesPerView: 11, spaceBetween: 16 },
              }}
            >
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
            </Swiper>
          )}
          {subMenu === "noknek" && (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={16}
              slidesPerView={10}
              navigation
              className="w-full" // opcionális belső padding
              breakpoints={{
                0: { slidesPerView: 2.5, spaceBetween: 8 },
                640: { slidesPerView: 4, spaceBetween: 12 },
                1024: { slidesPerView: 11, spaceBetween: 16 },
              }}
            >
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
              <SwiperSlide>
                <SubmenuItem title={"Guminő"} image={"/termekkepek/1.jpg"} />
              </SwiperSlide>
            </Swiper>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
