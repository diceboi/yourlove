'use client'

import { useState, useEffect } from 'react'
import { getUserById, updateUserRole } from '@/app/_actions/users'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import AdminSaveButton from '@/app/components/UI/Buttons/AdminSaveButton'
import AdminCancelButton from '@/app/components/UI/Buttons/AdminCancelButton'
import { TbChevronLeft } from 'react-icons/tb'
import Paragraph from '@/app/components/UI/Texts/Paragraph'
import Label from '@/app/components/UI/Texts/Label'

export default function AdminUserEdit({ userId, onClose }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [user, setUser] = useState(null)
    const [selectedRole, setSelectedRole] = useState('user')

    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            router.back()
        }
    }

    useEffect(() => {
        if (userId) {
            loadUser()
        }
    }, [userId])

    async function loadUser() {
        if (!userId) return

        setFetching(true)
        const result = await getUserById(userId)

        if (result.ok) {
            setUser(result.data)
            setSelectedRole(result.data.role || 'user')
        } else {
            toast.error(result.error || 'Hiba a felhasználó betöltésekor')
        }

        setFetching(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        const result = await updateUserRole(userId, selectedRole)

        if (result.ok) {
            toast.success('Szerepkör sikeresen frissítve')
            window.dispatchEvent(new Event('admin:users:changed'))
            handleClose()
        } else {
            toast.error(result.error || 'Hiba történt')
        }

        setLoading(false)
    }

    if (fetching) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Betöltés...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Felhasználó nem található</div>
            </div>
        )
    }

    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Névtelen'
    const isSuperadmin = user.role === 'superadmin'

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Header */}
            <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-1 border-b border-[var(--border)]">
                <div className="flex flex-col md:flex-row justify-between md:items-center items-start w-full gap-2">
                    <div className="flex flex-nowrap gap-2">
                        <button
                            type="button"
                            className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
                            onClick={handleClose}
                        >
                            <TbChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <Paragraph className="uppercase text-sm font-bold leading-tight">
                                Felhasználó szerepkör
                            </Paragraph>
                            <Paragraph className="text-xs leading-tight text-[var(--tertiary-text)]">
                                {fullName} - {user.email}
                            </Paragraph>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 space-y-6">
                {isSuperadmin && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            ⚠️ <strong>Figyelem:</strong> Szuperadmin szerepkör nem módosítható biztonsági okokból.
                        </p>
                    </div>
                )}

                <div className="bg-white border border-[var(--border)] rounded-2xl p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Felhasználó információk</h3>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label>Név</Label>
                                <p className="text-gray-900 mt-1">{fullName}</p>
                            </div>

                            <div>
                                <Label>Email</Label>
                                <p className="text-gray-900 mt-1">{user.email}</p>
                            </div>

                            <div>
                                <Label>Regisztráció</Label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(user.created_at).toLocaleDateString('hu-HU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div>
                                <Label>User ID</Label>
                                <p className="text-gray-600 mt-1 font-mono text-xs">{user.id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-6">
                        <h3 className="text-lg font-semibold mb-4">Szerepkör módosítása</h3>

                        <div className="max-w-md">
                            <Label>
                                Szerepkör *
                                {isSuperadmin && <span className="text-red-600 ml-2">(Nem módosítható)</span>}
                            </Label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                disabled={isSuperadmin || loading}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                            >
                                <option value="user">Felhasználó</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Szuperadmin</option>
                            </select>

                            <div className="mt-3 space-y-2 text-sm text-gray-600">
                                <p><strong>Felhasználó:</strong> Normál felhasználói jogosultságok</p>
                                <p><strong>Admin:</strong> Hozzáférés az admin felülethez, termékek és rendelések kezelése</p>
                                <p><strong>Szuperadmin:</strong> Teljes hozzáférés, felhasználók kezelése</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#f5f5f5] flex justify-end gap-4 p-6 border-t border-[var(--border)]">
                <AdminCancelButton title="Mégse" onclick={handleClose} />
                <AdminSaveButton title={loading ? 'Mentés...' : 'Mentés'} />
            </div>
        </form>
    )
}
