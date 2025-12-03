"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function formatHufShort(v) {
  if (v == null) return "";
  return v.toLocaleString("hu-HU") + " Ft";
}

export default function RevenueChartClient({ series = [] }) {
  if (!series || series.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Még nincs elég adat az árbevétel grafikonhoz.
      </div>
    );
  }

  // Recharts a "data" tömböt várja
  const data = series.map((m) => ({
    name: m.label,       // pl. "11.25"
    total: m.total || 0, // havi bevétel
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${Math.round(v / 1_000_000)}M`
                : v >= 1_000
                  ? `${Math.round(v / 1_000)}k`
                  : v
            }
          />
          <Tooltip
            cursor={{ fill: "var(--grey-bg)" }}
            formatter={(value) => [formatHufShort(value), "Árbevétel"]}
            labelFormatter={(label) => `Hónap: ${label}`}
          />
          <Bar dataKey="total" fill="var(--pink)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
