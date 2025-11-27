"use client";

import { useState } from "react";
import AdminProductSearch from "./AdminProductSearch";
import AddProductButton from "../UI/Buttons/AddProductButton";
import Label from "../UI/Texts/Label";
import { TbChevronDown } from "react-icons/tb";
import Modal from "@/app/components/UI/Modal";
import AdminProductCreate from "@/app/components/admin/AdminProductCreate"; // ⬅️ új komponens

export default function AdminProductListSettings() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sticky xl:top-0 top-0 bg-[var(--grey-bg)] py-2 z-30 px-6">
        <div className="flex flex-row gap-2 items-center justify-between">
          <AdminProductSearch />
          <AddProductButton onclick={() => setOpenCreate(true)} />
        </div>
      </div>

      {/* Új termék modal */}
      {openCreate && (
        <Modal openstate={true} onClose={() => setOpenCreate(false)} closeButton={false}>
          <AdminProductCreate onClose={() => setOpenCreate(false)} />
        </Modal>
      )}
    </>
  );
}
