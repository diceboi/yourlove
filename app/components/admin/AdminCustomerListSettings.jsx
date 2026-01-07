"use client";

import AdminCustomerSearch from "./AdminCustomerSearch";

export default function AdminCustomerListSettings() {
  return (
    <div className="flex flex-col gap-2 sticky xl:top-4 top-0 bg-[var(--grey-bg)] py-2 z-30 px-6">
      <div className="flex flex-row gap-2 items-center justify-between">
        <AdminCustomerSearch />
        {/* Placeholder for future action buttons like 'Add Customer' */}
      </div>
    </div>
  );
}
