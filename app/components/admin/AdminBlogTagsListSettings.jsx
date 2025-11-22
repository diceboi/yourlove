"use client";

import { useState } from "react";
import AdminProductSearch from "./AdminProductSearch";
import AddBlogTagButton from "@/app/components/UI/Buttons/AddBlogTagButton";
import Label from "../UI/Texts/Label";
import { TbChevronDown } from "react-icons/tb";
import Modal from "@/app/components/UI/Modal";
import AdminBlogTagsCreate from "@/app/components/admin/AdminBlogTagsCreate";

export default function AdminBlogTagsListSettings() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sticky xl:top-4 top-0 bg-[var(--grey-bg)] py-2 z-20 px-6">
        <div className="flex flex-row gap-2 items-center justify-between">
          <AdminProductSearch />
          <AddBlogTagButton onclick={() => setOpenCreate(true)} />
        </div>
      </div>

      {/* Új termék modal */}
      {openCreate && (
        <Modal openstate={true} onClose={() => setOpenCreate(false)} closeButton={false}>
          <AdminBlogTagsCreate onClose={() => setOpenCreate(false)} />
        </Modal>
      )}
    </>
  );
}
