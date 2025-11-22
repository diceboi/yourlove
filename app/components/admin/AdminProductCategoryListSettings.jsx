"use client"

import { useState } from "react";
import AdminProductSearch from "@/app/components/admin/AdminProductSearch";
import AddProductCategoryButton from "@/app/components/UI/Buttons/AddProductCategoryButton";
import Label from "@/app/components/UI/Texts/Label";
import { TbChevronDown } from "react-icons/tb";
import AdminProductCategoryCreate from "@/app/components/admin/AdminProductCategoryCreate";
import Modal from "@/app/components/UI/Modal";

export default function AdminProductCategoryListSettings() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sticky xl:top-4 top-0 bg-[var(--grey-bg)] py-2 z-20 px-6">
        <div className="flex flex-row gap-2 items-center justify-between">
          <AdminProductSearch />
          <AddProductCategoryButton onclick={() => setOpenCreate(true)} />
        </div>
      </div>

      {openCreate && (
        <Modal openstate={true} onClose={() => setOpenCreate(false)} closeButton={false}>
          <AdminProductCategoryCreate onClose={() => setOpenCreate(false)} />
        </Modal>
      )}
    </>
  );
}
