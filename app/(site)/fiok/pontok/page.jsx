import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserPoints, getPointsSettings } from "@/app/_actions/loyalty-points";
import UserPointsHistory from "@/app/components/account/UserPointsHistory";
import { TbCoins, TbGift, TbInfoCircle } from "react-icons/tb";

export const metadata = {
    title: "Pontjaim - Fiók",
    description: "Hűségpontok és előzmények",
};

function formatPoints(points) {
    return new Intl.NumberFormat("hu-HU").format(points || 0);
}

export default async function UserPointsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/bejelentkezes");
    }

    // Get user points
    const pointsResult = await getUserPoints(user.id);
    const currentPoints = pointsResult.ok ? pointsResult.points : 0;

    // Get points settings
    const settingsResult = await getPointsSettings();
    const settings = settingsResult.ok ? settingsResult.settings : null;

    return (
        <div className="space-y-6">
            {/* Pontegyenleg kártya */}
            <div className="bg-gradient-to-br from-[var(--pink)] to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TbCoins className="w-6 h-6" />
                            <h2 className="text-lg font-semibold">Hűségpontjaim</h2>
                        </div>
                        <div className="text-5xl font-bold mb-2">{formatPoints(currentPoints)}</div>
                        <p className="text-sm opacity-90">elérhető pont</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                            <TbGift className="w-12 h-12" />
                        </div>
                    </div>
                </div>

                {settings?.is_active && settings.redemption_rate && currentPoints > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-90">
                            Jelenlegi értéke:{" "}
                            <span className="font-bold text-lg">
                                {formatPoints(currentPoints * settings.redemption_rate)} Ft
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Hogyan működik */}
            {settings && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <TbInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Hogyan gyűjts pontokat?
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                {settings.is_active ? (
                                    <>
                                        <li>
                                            💰 <strong>Vásárolj:</strong> Minden{" "}
                                            {formatPoints(settings.points_per_currency)} Ft után 1 pont
                                        </li>
                                        {settings.minimum_order_value > 0 && (
                                            <li>
                                                📦 Minimum rendelési érték:{" "}
                                                {formatPoints(settings.minimum_order_value)} Ft
                                            </li>
                                        )}
                                        <li>
                                            🎁 <strong>Váltsd be:</strong> 1 pont ={" "}
                                            {settings.redemption_rate} Ft kedvezmény
                                        </li>
                                        <li>
                                            ✨ A pontokat a pénztárban használhatod fel a következő vásárlásodnál
                                        </li>
                                    </>
                                ) : (
                                    <li className="text-amber-700">
                                        ⚠️ A pontgyűjtés jelenleg szünetel
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Pontok előzményei */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
                <h3 className="text-xl font-bold mb-4">Pontok előzményei</h3>
                <UserPointsHistory userId={user.id} />
            </div>
        </div>
    );
}

export const dynamic = "force-dynamic";
