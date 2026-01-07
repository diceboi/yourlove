"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/UI/Modal";
import AdminCustomerEdit from "@/app/components/admin/AdminCustomerEdit";

export default function AdminCustomerModal({ params }) {
  const router = useRouter();
  const { id } = params;

  return (
    <Modal openstate={true} onClose={() => router.back()} closeButton={false}>
       <AdminCustomerEdit userId={id} onClose={() => router.back()} />
    </Modal>
  );
}
