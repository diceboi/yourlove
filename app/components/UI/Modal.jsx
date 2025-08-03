"use client";

import { motion } from "framer-motion";
import { CgClose } from "react-icons/cg";

export default function Modal({ children, openstate, onClose, classname, type }) {
  if (!openstate) return null;

  const handleBackgroundClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling up to the background
  };

  return (
    <motion.section
      className={`fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-10 z-[999]`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={handleBackgroundClick}
    >
      <motion.div
        className={`relative flex flex-col items-center bg-white bg-opacity-75 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] max-w-lg lg:p-8 p-4 ${classname} max-h-[90%] overflow-y-scroll`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={handleContentClick}
      >
        <button className="sticky top-0 right-0 z-50 self-end" onClick={onClose}>
          <CgClose className={`w-6 h-6 text-gray-700 hover:text-red-500`} />
        </button>
        {children}
      </motion.div>
    </motion.section>
  );
}
