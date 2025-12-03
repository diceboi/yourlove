"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";

import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch";
import Label from "@/app/components/UI/Texts/Label";

import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";

import {
  TbChevronLeft,
  TbMail,
  TbUser,
  TbCreditCard,
  TbTruck,
  TbShoppingBag,
} from "react-icons/tb";

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoneyHuf(value) {
  if (value == null) return "0 Ft";
  return value.toLocaleString("hu-HU") + " Ft";
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Piszkozat" },
  { value: "neworder", label: "Új rendelés" },
  { value: "processing", label: "Feldolgozás alatt" },
  { value: "pending_payment", label: "Fizetésre vár" },
  { value: "paid", label: "Fizetve" },
  { value: "shipped", label: "Kiszállítva" },
  { value: "delivered", label: "Futárnak átadva" },
  { value: "cancelled", label: "Törölve" },
];

function statusColor(value) {
  switch (value) {
    case "draft":
      return "bg-gray-200 text-gray-700";
    case "neworder":
      return "bg-[var(--pink)] text-white";
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "pending_payment":
      return "bg-amber-100 text-amber-700";
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "shipped":
      return "bg-indigo-100 text-indigo-700";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminOrderEdit({ order }) {
  // const order = orders; // Removed redundant assignment
  const router = useRouter();
  const supabase = createClient();

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Nem található ilyen rendelés.</p>
      </div>
    );
  }

  const [form, setForm] = useState(order);
  const [saving, setSaving] = useState(false);

  // Eredeti státusz, hogy tudjuk, mentéskor változott-e
  const [originalStatus, setOriginalStatus] = useState(order.status);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (!order?.id) return;
      setItemsLoading(true);
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("order_items fetch error", error);
        setItems([]);
      } else {
        setItems(data || []);
      }
      setItemsLoading(false);
    };

    fetchItems();
  }, [order?.id, supabase]);

  const handleClose = () => {
    router.back();
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVatToggle = (val) => {
    setForm((prev) => ({
      ...prev,
      wants_vat_invoice: val,
    }));
  };

  // ⬇️ Státusz gomb: csak local state-ben változtat, nem ír DB-be
  const handleStatusClick = (newStatus) => {
    setForm((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, order_number, created_at, cart_id, user_id, ...updatable } =
        form;

      const { data, error } = await supabase
        .from("orders")
        .update(updatable)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Order save error", error);
        toast.error("Hiba történt a mentés során.");
        setSaving(false);
        return;
      }

      setForm(data);
      window.dispatchEvent(new CustomEvent("admin:orders:changed"));
      toast.success("Rendelés mentve.");
      router.refresh();

      // ⬇️ Ha a státusz változott az eredetihez képest, küldj emailt
      if (data.status !== originalStatus) {
        try {
          await fetch("/api/admin/orders/status-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: data.id,
              order_number: data.order_number,
              status: data.status,
              email: data.email,
              name:
                `${data.customer_firstname || ""} ${data.customer_lastname || ""}`.trim() ||
                "Kedves Vásárló",
            }),
          });
        } catch (err) {
          console.error("Status email error", err);
        }
        setOriginalStatus(data.status);
      }
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    `${form.customer_firstname || ""} ${form.customer_lastname || ""}`.trim() ||
    "Vendég";

  const shippingDisplay = {
    name: fullName,
    zip: form.shipping_zip || form.billing_zip,
    city: form.shipping_city || form.billing_city,
    address: form.shipping_address || form.billing_address,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-10 border-b border-[var(--border)]">
        <div className="flex flex-col md:flex-row justify-between md:items-center items-start w-full gap-2">
          <div className="flex flex-nowrap gap-2">
            <button
              className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
              onClick={handleClose}
            >
              <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
            </button>
            <div className="flex flex-col lg:flex-row gap-1 items-start lg:items-center">
              <h1 className="text-xl font-bold w-full p-2">
                Rendelés #{form.order_number}
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 pr-3 pb-2">
            <Paragraph classname="text-sm font-semibold">
              Összeg:{" "}
              <span className="text-[var(--green)]">
                {formatMoneyHuf(form.total_huf)}
              </span>
            </Paragraph>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:p-6 p-3 pb-20 gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* BAL OSZLOP */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Vevő adatai */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TbUser className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Vevő adatai</H3>
              </div>

              <SmallTextInput
                legend="Vezetéknév"
                name="customer_lastname"
                value={form.customer_lastname || ""}
                handleChange={handleFieldChange}
              />
              <SmallTextInput
                legend="Keresztnév"
                name="customer_firstname"
                value={form.customer_firstname || ""}
                handleChange={handleFieldChange}
              />

              <SmallTextInput
                legend="Email"
                name="email"
                value={form.email || ""}
                handleChange={handleFieldChange}
                after={
                  form.email ? (
                    <a
                      href={`mailto:${form.email}`}
                      className="text-[var(--pink)] text-xs underline"
                    >
                      Email írása
                    </a>
                  ) : undefined
                }
              />

              <SmallTextInput
                legend="Telefon"
                name="phone"
                value={form.phone || ""}
                handleChange={handleFieldChange}
              />

              <div className="flex items-center justify-between pt-2">
                <Label classname="font-bold text-xs">ÁFA-s számla igény?</Label>
                <ToggleSwitch
                  checked={!!form.wants_vat_invoice}
                  onChange={handleVatToggle}
                  firstlabel={"Nem"}
                  secondlabel={"Igen"}
                />
              </div>

              {form.wants_vat_invoice && (
                <div className="space-y-2">
                  <SmallTextInput
                    legend="Cégnév"
                    name="company_name"
                    value={form.company_name || ""}
                    handleChange={handleFieldChange}
                  />
                  <SmallTextInput
                    legend="Adószám"
                    name="company_tax_number"
                    value={form.company_tax_number || ""}
                    handleChange={handleFieldChange}
                  />
                </div>
              )}
            </div>

            {/* Szállítási cím */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TbTruck className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Szállítási cím</H3>
              </div>

              <SmallTextInput
                legend="Szállítási irányítószám"
                name="shipping_zip"
                value={form.shipping_zip || ""}
                handleChange={handleFieldChange}
              />
              <SmallTextInput
                legend="Szállítási város"
                name="shipping_city"
                value={form.shipping_city || ""}
                handleChange={handleFieldChange}
              />
              <SmallTextInput
                legend="Szállítási cím"
                name="shipping_address"
                value={form.shipping_address || ""}
                handleChange={handleFieldChange}
              />
            </div>

            {/* Számlázási cím */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TbCreditCard className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Számlázási cím</H3>
              </div>

              <SmallTextInput
                legend="Irányítószám"
                name="billing_zip"
                value={form.billing_zip || ""}
                handleChange={handleFieldChange}
              />
              <SmallTextInput
                legend="Város"
                name="billing_city"
                value={form.billing_city || ""}
                handleChange={handleFieldChange}
              />
              <SmallTextInput
                legend="Utca, házszám"
                name="billing_address"
                value={form.billing_address || ""}
                handleChange={handleFieldChange}
              />
            </div>

            {/* Megjegyzés */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <TbMail className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Megjegyzés</H3>
              </div>
              <Textarea
                legend="Ügyfél megjegyzés / belső jegyzet"
                name="notes"
                value={form.notes || ""}
                handleChange={handleFieldChange}
                rows={4}
              />
            </div>
          </div>

          {/* JOBB OSZLOP */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Összegzés */}
            <div className="space-y-3 border border-[var(--border)] rounded-2xl p-4 bg-white">
              <H3>Rendelés összegzés</H3>
              <div className="flex justify-between text-sm">
                <span>Rendelés száma:</span>
                <span className="font-semibold">#{form.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Létrehozva:</span>
                <span>{formatDateTime(form.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Részösszeg:</span>
                <span>{formatMoneyHuf(form.subtotal_huf)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Végösszeg:</span>
                <span className="font-bold text-[var(--green)]">
                  {formatMoneyHuf(form.total_huf)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pénznem:</span>
                <span>{form.currency || "HUF"}</span>
              </div>
            </div>

            {/* Szállítás */}
            <div className="space-y-3 border border-[var(--border)] rounded-2xl p-4 bg-white">
              <div className="flex items-center gap-2">
                <TbTruck className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Szállítási adatok</H3>
              </div>

              <Paragraph classname="text-xs text-gray-500">
                Szállítási cím az alábbi adatok alapján:
              </Paragraph>

              <div className="mt-2 text-sm space-y-1">
                <div className="font-semibold">{shippingDisplay.name}</div>
                <div>
                  {shippingDisplay.zip || ""} {shippingDisplay.city || ""}
                </div>
                <div>{shippingDisplay.address || ""}</div>
              </div>

              <SmallTextInput
                legend="Szállítási mód"
                name="shipping_method"
                value={form.shipping_method || ""}
                handleChange={handleFieldChange}
              />
            </div>

            {/* Tételek */}
            <div className="space-y-3 border border-[var(--border)] rounded-2xl p-4 bg-white">
              <div className="flex items-center gap-2">
                <TbShoppingBag className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                <H3>Rendelés tételei</H3>
              </div>

              {itemsLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-[var(--border)]/60 rounded-lg"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <Paragraph classname="text-sm text-gray-500">
                  Ehhez a rendeléshez nincs rögzített tétel.
                </Paragraph>
              ) : (
                <div className="space-y-3 max-h-72 overflow-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 border-b border-[var(--border)] pb-3 last:border-b-0"
                    >
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.name || "Tétel kép"}
                          className="w-12 h-12 rounded-md object-cover flex-none"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-[var(--border)] flex-none" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {item.name || "Termék"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mennyiség: {item.qty} db
                        </div>
                        {item.product_id && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Termék ID: {item.product_id}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs min-w-[90px]">
                        <div>{formatMoneyHuf(item.unit_price_huf)}</div>
                        <div className="text-gray-500">
                          Összesen:{" "}
                          {formatMoneyHuf(
                            (item.unit_price_huf || 0) * (item.qty || 0)
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Státuszváltó (csak local state) */}
            <div className="space-y-3 border border-[var(--border)] rounded-2xl p-4 bg-white">
              <H3>Rendelés státusza</H3>
              <Paragraph classname="text-xs text-gray-500">
                Válaszd ki a helyes státuszt. A változás akkor lép életbe és az
                ügyfélnek szóló értesítő email is akkor megy ki, amikor a{" "}
                <strong>Mentés</strong> gombra kattintasz.
              </Paragraph>

              <div className="flex flex-wrap gap-2 mt-2">
                {STATUS_OPTIONS.map((s) => {
                  const isActive = form.status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      disabled={saving}
                      onClick={() => handleStatusClick(s.value)}
                      className={[
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                        isActive
                          ? `${statusColor(s.value)} border-transparent`
                          : "bg-white text-gray-700 border-[var(--border)] hover:bg-[var(--border)]/60",
                      ].join(" ")}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Technikai adatok */}
            <div className="space-y-2 border border-[var(--border)] rounded-2xl p-4 bg-white text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-mono truncate max-w-[60%] text-right">
                  {form.id}
                </span>
              </div>
              {form.cart_id && (
                <div className="flex justify-between">
                  <span>Cart ID:</span>
                  <span className="font-mono truncate max-w-[60%] text-right">
                    {form.cart_id}
                  </span>
                </div>
              )}
              {form.user_id && (
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-mono truncate max-w-[60%] text-right">
                    {form.user_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
        <div className="text-xs text-gray-500 px-2">
          Rendelés #{form.order_number} • {formatDateTime(form.created_at)}
        </div>
        <div className="flex flex-row gap-2">
          <AdminCancelButton
            title="Mégse"
            link=""
            onclick={handleClose}
            buttonicon="TbX"
          />
          <AdminSaveButton
            title={saving ? "Mentés..." : "Mentés"}
            link=""
            onclick={handleSave}
            buttonicon="TbDeviceFloppy"
          />
        </div>
      </div>
    </div>
  );
}
