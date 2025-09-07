"use client"

import { useState } from "react";
import AdminProductSearch from "@/app/components/admin/AdminProductSearch";
import AddBlogCategoryButton from "@/app/components/UI/Buttons/AddBlogCategoryButton";
import Label from "@/app/components/UI/Texts/Label";
import { TbChevronDown } from "react-icons/tb";
import AdminBlogCategoryCreate from "@/app/components/admin/AdminBlogCategoryCreate";
import Modal from "@/app/components/UI/Modal";

export default function AdminblogCategoryListSettings() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sticky top-0 bg-[var(--grey-bg)] py-2 z-20 px-6">
        <div className="flex flex-row gap-2 items-center justify-between">
          <AdminProductSearch />
          <AddBlogCategoryButton onclick={() => setOpenCreate(true)} />
        </div>
      </div>

      {openCreate && (
        <Modal openstate={true} onClose={() => setOpenCreate(false)} closeButton={false}>
          <AdminBlogCategoryCreate onClose={() => setOpenCreate(false)} />
        </Modal>
      )}
    </>
  );
}
