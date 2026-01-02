"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { TbChevronLeft, TbTrash } from "react-icons/tb"
import { createClient } from "@/utils/supabase/client"
import H3 from "@/app/components/UI/Texts/H3"
import Label from "@/app/components/UI/Texts/Label"
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput"
import Textarea from "@/app/components/UI/Inputfield/Textarea"
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch"
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton"
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton"

export default function AdminAnnouncementEdit({ announcementId, onClose }) {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [published, setPublished] = useState(false)

    const [form, setForm] = useState({
        content: "",
        link_url: "",
        bg_color: "var(--black)",
        text_color: "white",
        display_order: 0,
    })

    useEffect(() => {
        async function fetchAnnouncement() {
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .eq("id", announcementId)
                .single()

            if (error) {
                console.error("Fetch error:", error)
                toast.error("Hiba történt a hirdetés betöltése során")
                return
            }

            if (data) {
                setForm({
                    content: data.content || "",
                    link_url: data.link_url || "",
                    bg_color: data.bg_color || "var(--black)",
                    text_color: data.text_color || "white",
                    display_order: data.display_order || 0,
                })
                setPublished(data.published || false)
            }
            setLoading(false)
        }

        if (announcementId) {
            fetchAnnouncement()
        }
    }, [announcementId])

    const handleClose = () => {
        if (onClose) onClose()
        else router.back()
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        const payload = {
            ...form,
            published: !!published,
            display_order: parseInt(form.display_order) || 0,
        }

        if (!payload.content || payload.content.trim() === "") {
            toast.error("A tartalom megadása kötelező!")
            return
        }

        const { error } = await supabase
            .from("announcements")
            .update(payload)
            .eq("id", announcementId)

        if (error) {
            console.error("Update error:", error)
            toast.error("Hiba történt a mentés során")
            return
        }

        window.dispatchEvent(new CustomEvent("admin:announcements:changed"))
        toast.success("Hirdetés frissítve!")
        handleClose()
        router.refresh()
    }

    const handleDelete = async () => {
        if (!confirm("Biztosan törlöd ezt a hirdetést?")) return

        const { error } = await supabase
            .from("announcements")
            .delete()
            .eq("id", announcementId)

        if (error) {
            console.error("Delete error:", error)
            toast.error("Hiba történt a törlés során")
            return
        }

        window.dispatchEvent(new CustomEvent("admin:announcements:changed"))
        toast.success("Hirdetés törölve!")
        handleClose()
        router.push("/admin/hirdetesek")
        router.refresh()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-gray-500">Betöltés...</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-1 border-b border-[var(--border)]">
                <div className="flex flex-nowrap gap-2 w-full">
                    <button
                        className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
                        onClick={handleClose}
                    >
                        <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
                    </button>
                    <div className="flex lg:flex-row flex-col gap-1 items-center flex-1">
                        <h1 className="text-xl font-bold w-full p-2">
                            {form.content ? form.content.substring(0, 50) + "..." : "Hirdetés szerkesztése"}
                        </h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hirdetés törlése"
                    >
                        <TbTrash className="w-5 h-5" />
                        <span className="hidden md:inline">Törlés</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:p-6 p-3 flex-1 overflow-auto pb-24">
                <div className="space-y-4 max-w-2xl">
                    <H3>Hirdetés beállítások</H3>

                    <Textarea
                        legend="Tartalom *"
                        handleChange={handleChange}
                        name="content"
                        value={form.content}
                        placeholder="pl. 🎉 Ingyenes kiszállítás 20.000 Ft felett!"
                        rows={3}
                    />

                    <SmallTextInput
                        legend="Link (opcionális)"
                        handleChange={handleChange}
                        name="link_url"
                        value={form.link_url}
                        placeholder="pl. /akciok"
                    />

                    <div>
                        <Label>Sorrend</Label>
                        <input
                            type="number"
                            name="display_order"
                            value={form.display_order}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded p-2 mt-1"
                            min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Kisebb szám = előrébb jelenik meg a sorban
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="border-t pt-4 mt-6">
                        <Label>Előnézet</Label>
                        <div
                            className="mt-2 p-4 rounded text-sm text-center"
                            style={{
                                backgroundColor: form.bg_color || 'var(--black)',
                                color: form.text_color || 'white'
                            }}
                        >
                            {form.content || "A hirdetés tartalma itt jelenik meg..."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
                <ToggleSwitch checked={published} onChange={setPublished} firstlabel={"Vázlat"} secondlabel={"Közzétéve"} />
                <div className="flex flex-row gap-2">
                    <AdminCancelButton
                        title={"Mégse"}
                        link={""}
                        onclick={handleClose}
                        buttonicon={""}
                    />
                    <AdminSaveButton
                        title={"Mentés"}
                        link={""}
                        onclick={handleSave}
                        buttonicon={""}
                    />
                </div>
            </div>
        </div>
    )
}
