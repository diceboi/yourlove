"use client";

import { useState } from "react";
import AdminBlogSearch from "./AdminBlogSearch";
import AddBlogButton from "@/app/components/UI/Buttons/AddBlogButton";
import Label from "../UI/Texts/Label";
import { TbChevronDown } from "react-icons/tb";
import Modal from "@/app/components/UI/Modal";
import AdminBlogCreate from "./AdminBlogCreate";

export default function AdminBlogListSettings() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sticky top-0 bg-[var(--grey-bg)] py-2 z-20 px-6">
        <div className="flex flex-row gap-2 items-center justify-between">
          <AdminBlogSearch />
          <AddBlogButton onclick={() => setOpenCreate(true)} />
        </div>
      </div>

      {/* Új termék modal */}
      {openCreate && (
        <Modal openstate={true} onClose={() => setOpenCreate(false)} closeButton={false}>
          <AdminBlogCreate onClose={() => setOpenCreate(false)} />
        </Modal>
      )}
    </>
  );
}
