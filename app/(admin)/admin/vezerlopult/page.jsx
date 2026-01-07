import AdminHero from "@/app/components/admin/AdminHero";
import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import { createClient } from "@/utils/supabase/server";
import RevenueChartClient from "@/app/components/admin/RevenueChartClient";


export const revalidate = 0; // mindig friss adat

function formatHuf(v) {
  if (v == null) return "0 Ft";
  return v.toLocaleString("hu-HU") + " Ft";
}

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

function statusLabel(status) {
  switch (status) {
    case "draft":
      return "Piszkozat";
    case "neworder":
      return "Új rendelés";
    case "processing":
      return "Feldolgozás alatt";
    case "pending_payment":
      return "Fizetésre vár";
    case "paid":
      return "Fizetve";
    case "shipped":
      return "Kiszállítva";
    case "delivered":
      return "Futárnak átadva";
    case "cancelled":
      return "Törölve";
    default:
      return status || "Ismeretlen";
  }
}

function statusPillClass(status) {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-700";
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

// Mini stat csempe
function StatTile({ label, value, subtitle }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}

// Egyszerű oszlopdiagram (árbevétel hónapokra bontva)
function RevenueChart({ series }) {
  if (!series || series.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Még nincs elég adat az árbevétel grafikonhoz.
      </div>
    );
  }

  const max = Math.max(...series.map((m) => m.total), 1);

  return (
    <div className="h-48 flex items-end gap-3">
      {series.map((m) => (
        <div key={m.label} className="flex flex-col items-center flex-1">
          <div className="w-full bg-[var(--border)]/60 rounded-lg overflow-hidden flex items-end">
            <div
              className="w-full bg-[var(--pink)] rounded-lg transition-all"
              style={{ height: `${(m.total / max) * 100 || 0}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-gray-600 text-center">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Legújabb rendelések lista
function LatestOrdersCard({ orders }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Legújabb rendelések
        </h3>
        <span className="text-xs text-gray-500">
          {orders.length} db mutatva
        </span>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">Még nincs rendelés.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {orders.map((o) => {
            const fullName =
              `${o.customer_firstname || ""} ${
                o.customer_lastname || ""
              }`.trim() || "Vendég";

            return (
              <li key={o.id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    #{o.order_number}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(o.created_at)} · {fullName}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-[var(--green)]">
                    {formatHuf(o.total_huf)}
                  </span>
                  <span
                    className={
                      "px-2 py-0.5 rounded-full text-[10px] font-medium " +
                      statusPillClass(o.status)
                    }
                  >
                    {statusLabel(o.status)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Legkelendőbb termékek
function TopProductsCard({ products }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Legkelendőbb termékek
        </h3>
        <span className="text-xs text-gray-500">
          {products.length} db mutatva
        </span>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500">Még nincs eladott termék.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {products.map((p) => (
            <li
              key={p.product_id || p.name}
              className="py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                  {p.name || "Termék"}
                </div>
                <div className="text-xs text-gray-500">
                  {p.qty} db · {formatHuf(p.revenue)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminVezerlopultPage() {
  const supabase = await createClient();

  // Lekérjük az utolsó ~200 rendelést – ebből számolunk mindent
  const { data: ordersRaw } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, status, total_huf, customer_firstname, customer_lastname"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = ordersRaw || [];

  // Order tételek a top termékekhez (nem baj, ha itt is csak az utolsó X rendelésből dolgozunk)
  const { data: itemsRaw } = await supabase
    .from("order_items")
    .select("product_id, name, qty, unit_price_huf")
    .limit(1000);

  const items = itemsRaw || [];

  // --- Összesített statok ---
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.total_huf || 0),
    0
  );
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  const newOrders = orders.filter((o) => o.status === "neworder").length;

  // --- Árbevétel: utolsó 6 hónap havi bontás ---
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    months.push({
      key,
      label: `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
        d.getFullYear()
      ).slice(-2)}`,
      total: 0,
    });
  }

  const monthMap = Object.fromEntries(months.map((m) => [m.key, m]));

  for (const o of orders) {
    const d = new Date(o.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (monthMap[key]) {
      monthMap[key].total += o.total_huf || 0;
    }
  }

  const revenueSeries = months;

  // --- Top termékek az order_items alapján ---
  const productAgg = new Map(); // product_id -> { qty, revenue, name }

  for (const it of items) {
    const key = it.product_id || it.name || "unknown";
    if (!productAgg.has(key)) {
      productAgg.set(key, {
        product_id: it.product_id,
        name: it.name,
        qty: 0,
        revenue: 0,
      });
    }
    const rec = productAgg.get(key);
    rec.qty += it.qty || 0;
    rec.revenue += (it.unit_price_huf || 0) * (it.qty || 0);
  }

  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // --- Legújabb 5 rendelés ---
  const latestOrders = orders.slice(0, 5);

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <AdminHero />

          <div className="px-6 pb-6">

          {/* Felső stat csempék */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatTile
              label="Összes árbevétel (utolsó 200 rendelés)"
              value={formatHuf(totalRevenue)}
            />
            <StatTile
              label="Rendelések száma"
              value={totalOrders}
              subtitle={`${newOrders} új rendelés`}
            />
            <StatTile
              label="Fizetett rendelések"
              value={paidOrders}
            />
            <StatTile
              label="Utolsó 30 nap"
              value={formatHuf(
                orders
                  .filter((o) => {
                    const d = new Date(o.created_at);
                    const diff =
                      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
                    return diff <= 30;
                  })
                  .reduce((s, o) => s + (o.total_huf || 0), 0)
              )}
              subtitle="Becsült árbevétel"
            />
          </div>

          {/* Középső sor: árbevétel grafikon + legújabb rendelések */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Árbevétel alakulása (havi)
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Utolsó 6 hónap az orders tábla alapján.
              </p>
              <RevenueChartClient series={revenueSeries} />
            </div>

            <LatestOrdersCard orders={latestOrders} />
          </div>

          {/* Alsó sor: top termékek */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TopProductsCard products={topProducts} />
            {/* ide később betehetsz pl. kupon statokat, kosárelhagyás, stb. */}
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Jegyzet / teendők
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Ide később rakhatsz manuális jegyzeteket, vagy más statisztikát.
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Új rendelés státuszának áttekintése</li>
                <li>Akciós termékek készletének ellenőrzése</li>
                <li>Heti riport export (később automatizálható)</li>
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
