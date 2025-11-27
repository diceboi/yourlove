"use client";

import { useState } from "react";
import AdminProductSearch from "./AdminProductSearch";

export default function AdminOrderListSettings() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 sticky xl:top-0 top-0 bg-[var(--grey-bg)] py-2 z-30 px-6">
        <div className="flex flex-row gap-2 items-center justify-between">
          <AdminProductSearch />
        </div>
      </div>
    </>
  );
}
