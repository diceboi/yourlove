"use client";

import { useState, useEffect } from "react";
import { getPointsSettings, updatePointsSettings } from "@/app/_actions/loyalty-points";
import { toast } from "react-toastify";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";
import Label from "@/app/components/UI/Texts/Label";

export default function AdminPointsSettings() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        points_per_currency: 100,
        minimum_order_value: 0,
        redemption_rate: 1,
        is_active: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setFetching(true);
        const result = await getPointsSettings();

        if (result.ok && result.settings) {
            setFormData(result.settings);
        }

        setFetching(false);
    }

    function handleChange(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const result = await updatePointsSettings(formData);

        if (result.ok) {
            toast.success('Beállítások sikeresen mentve');
            loadSettings();
        } else {
            toast.error(result.error || 'Hiba történt');
        }

        setLoading(false);
    }

    function handleReset() {
        loadSettings();
    }

    if (fetching) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Betöltés...</div>
            </div>
        );
    }

    // Calculate example
    const exampleOrder = 10000;
    const examplePoints = Math.floor(exampleOrder / formData.points_per_currency);
    const exampleRedemption = 100 * formData.redemption_rate;

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
            <div className="bg-white border border-[var(--border)] rounded-2xl p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Pontrendszer Beállítások</h2>
                    <p className="text-gray-600 text-sm">
                        Állítsd be hogy a vásárlók hogyan gyűjthetnek pontokat a vásárlásaik után.
                    </p>
                </div>

                <div className="border-t border-[var(--border)] pt-6 space-y-6">
                    {/* System Active Toggle */}
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <Label>Pontrendszer Állapot</Label>
                            <p className="text-sm text-gray-600 mt-1">
                                {formData.is_active ? 'Aktív - A vásárlók pontokat gyűjtenek' : 'Inaktív - A pontgyűjtés szünetel'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {formData.is_active ? 'Bekapcsolva' : 'Kikapcsolva'}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleChange('is_active', !formData.is_active)}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.is_active ? 'bg-[var(--green)]' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Points per Currency */}
                    <div>
                        <Label>
                            Pontarány (1 pont = X Ft) *
                        </Label>
                        <input
                            type="number"
                            value={formData.points_per_currency}
                            onChange={(e) => handleChange('points_per_currency', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent mt-2"
                            required
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            1 pontot érnek el minden {formData.points_per_currency} Ft vásárlás után
                        </p>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Példa:</strong> {exampleOrder.toLocaleString('hu-HU')} Ft vásárlás = <strong>{examplePoints} pont</strong>
                            </p>
                        </div>
                    </div>

                    {/* Minimum Order Value */}
                    <div>
                        <Label>
                            Minimum rendelési érték (Ft)
                        </Label>
                        <input
                            type="number"
                            value={formData.minimum_order_value}
                            onChange={(e) => handleChange('minimum_order_value', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent mt-2"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            {formData.minimum_order_value === 0
                                ? 'Nincs minimum érték - minden rendelés után jár pont'
                                : `Csak ${formData.minimum_order_value.toLocaleString('hu-HU')} Ft feletti rendelések után jár pont`
                            }
                        </p>
                    </div>

                    {/* Redemption Rate */}
                    <div>
                        <Label>
                            Beváltási arány (1 pont = X Ft) *
                        </Label>
                        <input
                            type="number"
                            value={formData.redemption_rate}
                            onChange={(e) => handleChange('redemption_rate', parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent mt-2"
                            required
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            1 pont értéke {formData.redemption_rate} Ft kedvezményt ér
                        </p>
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Példa:</strong> 100 pont = <strong>{exampleRedemption.toLocaleString('hu-HU')} Ft</strong> kedvezmény
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            ⚠️ Jelenleg csak pontgyűjtés működik, beváltás később kerül implementálásra
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="border-t border-[var(--border)] pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">ℹ️ Fontos tudnivalók</h3>
                        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                            <li>A pontok a sikeres rendelés leadása után automatikusan jóváírásra kerülnek</li>
                            <li>A pontok nem járnak vissza törölt vagy visszautasított rendelések után</li>
                            <li>Admin jogosultsággal manuálisan is lehet pontokat módosítani</li>
                            <li>A beállítások változtatása csak az új rendelésekre vonatkozik</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <AdminCancelButton title="Mégse" onclick={handleReset} />
                <AdminSaveButton title={loading ? 'Mentés...' : 'Mentés'} />
            </div>
        </form>
    );
}
