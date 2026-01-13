'use client'

import { useState } from 'react'
import { TbCoins, TbSettings } from 'react-icons/tb'
import AdminPointsList from '@/app/components/admin/AdminPointsList'
import AdminPointsSettings from '@/app/components/admin/AdminPointsSettings'

export default function PointsTabs({ users }) {
    const [activeTab, setActiveTab] = useState('users')

    return (
        <div>
            {/* Tab Navigation */}
            <div className="border-b border-[var(--border)] bg-white px-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'users'
                                ? 'border-[var(--pink)] text-[var(--pink)] font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <TbCoins className="w-5 h-5" />
                        Felhasználók Pontjai
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'settings'
                                ? 'border-[var(--pink)] text-[var(--pink)] font-semibold'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <TbSettings className="w-5 h-5" />
                        Beállítások
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-6">
                {activeTab === 'users' && <AdminPointsList users={users} />}
                {activeTab === 'settings' && <AdminPointsSettings />}
            </div>
        </div>
    )
}
