"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import Image from "next/image"
import { TbChevronLeft, TbPhoto, TbTrash } from "react-icons/tb"
import { createClient } from "@/utils/supabase/client"
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal"
import H3 from "@/app/components/UI/Texts/H3"
import Label from "@/app/components/UI/Texts/Label"
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput"
import Textarea from "@/app/components/UI/Inputfield/Textarea"
import ToggleSwitch from "@/app/components/UI/Inputfield/ToggleSwitch"
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton"
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton"

export default function AdminSliderEdit({ slide, onClose }) {
    const router = useRouter()
    const supabase = createClient()

    const [published, setPublished] = useState(slide?.published || false)
    const [mediaModalOpen, setMediaModalOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(slide?.bg_image || "")
    const [deleting, setDeleting] = useState(false)

    const [form, setForm] = useState({
        title: slide?.title || "",
        subtitle: slide?.subtitle || "",
        description: slide?.description || "",
        title_color: slide?.title_color || "text-white",
        button_type: slide?.button_type || "pink",
        button_title: slide?.button_title || "",
        button_link: slide?.button_link || "",
        button_icon: slide?.button_icon || "TbArrowRight",
        bg_image: slide?.bg_image || "",
        bg_image_alt: slide?.bg_image_alt || "",
        bg_overlay_color: slide?.bg_overlay_color || "bg-[var(--black)]",
        bg_overlay_opacity: slide?.bg_overlay_opacity || "opacity-10",
        display_order: slide?.display_order || 0,
    })

    const handleClose = () => {
        if (onClose) onClose()
        else router.back()
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Biztosan törölni szeretnéd a "${form.title || 'Névtelen slide'}" slide-ot? Ez a művelet nem vonható vissza.`
        )

        if (!confirmed) return

        setDeleting(true)
        try {
            const { error } = await supabase
                .from('hero_slides')
                .delete()
                .eq('id', slide.id)

            if (error) throw error

            toast.success('Slide törölve!')
            window.dispatchEvent(new CustomEvent('admin:slides:changed'))
            handleClose()
            router.refresh()
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Hiba történt a törlés során')
        } finally {
            setDeleting(false)
        }
    }

    const handleSave = async () => {
        const payload = {
            ...form,
            bg_image: selectedImage || null,
            published: !!published,
            display_order: parseInt(form.display_order) || 0,
        }

        if (!payload.title) {
            toast.error("A cím megadása kötelező!")
            return
        }

        const { error } = await supabase
            .from("hero_slides")
            .update(payload)
            .eq("id", slide.id)

        if (error) {
            console.error("Save error:", error)
            toast.error("Hiba történt a mentés során")
            return
        }

        window.dispatchEvent(new CustomEvent("admin:slides:changed"))
        toast.success("Slide mentve!")
        handleClose()
        router.refresh()
    }

    return (
        <>
            <MediaLibraryModal
                isOpen={mediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={(imageUrl) => {
                    if (imageUrl) {
                        setSelectedImage(imageUrl)
                        setForm((prev) => ({ ...prev, bg_image: imageUrl }))
                    }
                    setMediaModalOpen(false)
                }}
            />

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
                        <div className="flex lg:flex-row flex-col gap-1 items-center">
                            <h1 className="text-xl font-bold w-full p-2">
                                {form.title || "Slide szerkesztése"}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:p-6 p-3 flex-1 overflow-auto pb-24">
                    <div className="flex flex-col md:flex-row gap-8 pb-8">
                        {/* Background Image */}
                        <div className="relative md:w-1/2 overflow-hidden rounded-lg">
                            <div className="mb-2">
                                <Label>Háttérkép</Label>
                            </div>
                            {selectedImage ? (
                                <div
                                    className="relative cursor-pointer group border border-gray-300 rounded-md overflow-hidden"
                                    onClick={() => setMediaModalOpen(true)}
                                >
                                    <Image
                                        src={selectedImage}
                                        width={600}
                                        height={400}
                                        alt={form.bg_image_alt || "Slide háttérkép"}
                                        className="rounded-lg w-full h-auto group-hover:opacity-70"
                                    />
                                    <span className="absolute bottom-2 right-2 bg-white text-sm px-2 py-1 rounded shadow">
                                        Kép módosítása
                                    </span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setMediaModalOpen(true)}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-md p-12 hover:border-[var(--pink)] hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2"
                                >
                                    <TbPhoto className="w-16 h-16 text-gray-400" />
                                    <span className="text-sm text-gray-600">Háttérkép kiválasztása</span>
                                </button>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 w-full md:w-1/2">
                            <H3>Slide beállítások</H3>

                            <SmallTextInput
                                legend="Cím *"
                                handleChange={handleChange}
                                name="title"
                                value={form.title}
                                placeholder="pl. Akciós termékek"
                            />

                            <SmallTextInput
                                legend="Alcím"
                                handleChange={handleChange}
                                name="subtitle"
                                value={form.subtitle}
                                placeholder="pl. Most kihagyhatatlan áron"
                            />

                            <Textarea
                                legend="Leírás"
                                handleChange={handleChange}
                                name="description"
                                value={form.description}
                                placeholder="Rövid leírás..."
                                rows={3}
                            />

                            <SmallTextInput
                                legend="Kép alt text"
                                handleChange={handleChange}
                                name="bg_image_alt"
                                value={form.bg_image_alt}
                                placeholder="Kép leírása"
                            />

                            <div>
                                <Label>Cím szín</Label>
                                <select
                                    name="title_color"
                                    value={form.title_color}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                >
                                    <option value="text-white">Fehér</option>
                                    <option value="text-black">Fekete</option>
                                    <option value="text-[var(--pink)]">Rózsaszín</option>
                                    <option value="text-[var(--green)]">Zöld</option>
                                </select>
                            </div>

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
                            </div>

                        </div>
                    </div>

                    {/* Button Settings */}
                    <div className="space-y-4 pb-8 border-t pt-8">
                        <H3>Gomb beállítások</H3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <SmallTextInput
                                legend="Gomb szöveg"
                                handleChange={handleChange}
                                name="button_title"
                                value={form.button_title}
                                placeholder="pl. Érdekel"
                            />

                            <SmallTextInput
                                legend="Gomb link"
                                handleChange={handleChange}
                                name="button_link"
                                value={form.button_link}
                                placeholder="pl. /termekek"
                            />

                            <div>
                                <Label>Gomb stílus</Label>
                                <select
                                    name="button_type"
                                    value={form.button_type}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                >
                                    <option value="pink">Rózsaszín</option>
                                    <option value="green">Zöld</option>
                                    <option value="cream-pink">Krém-rózsaszín</option>
                                    <option value="black">Fekete</option>
                                    <option value="white">Fehér</option>
                                    <option value="black-border">Fekete keret</option>
                                    <option value="white-border">Fehér keret</option>
                                </select>
                            </div>

                            <div>
                                <Label>Gomb ikon</Label>
                                <select
                                    name="button_icon"
                                    value={form.button_icon}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                >
                                    <option value="TbArrowRight">Jobbra nyíl</option>
                                    <option value="TbShoppingCart">Kosár</option>
                                    <option value="TbHeart">Szív</option>
                                    <option value="TbStar">Csillag</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Overlay Settings */}
                    <div className="space-y-4 pb-8 border-t pt-8">
                        <H3>Overlay beállítások</H3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Overlay szín</Label>
                                <select
                                    name="bg_overlay_color"
                                    value={form.bg_overlay_color}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                >
                                    <option value="bg-[var(--black)]">Fekete</option>
                                    <option value="bg-white">Fehér</option>
                                    <option value="bg-[var(--pink)]">Rózsaszín</option>
                                    <option value="bg-[var(--green)]">Zöld</option>
                                </select>
                            </div>

                            <div>
                                <Label>Overlay átlátszóság</Label>
                                <select
                                    name="bg_overlay_opacity"
                                    value={form.bg_overlay_opacity}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 mt-1"
                                >
                                    <option value="opacity-0">0% (nincs)</option>
                                    <option value="opacity-10">10%</option>
                                    <option value="opacity-20">20%</option>
                                    <option value="opacity-30">30%</option>
                                    <option value="opacity-40">40%</option>
                                    <option value="opacity-50">50%</option>
                                    <option value="opacity-60">60%</option>
                                    <option value="opacity-70">70%</option>
                                    <option value="opacity-80">80%</option>
                                    <option value="opacity-90">90%</option>
                                    <option value="opacity-100">100%</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
                <ToggleSwitch checked={published} onChange={setPublished} firstlabel={"Vázlat"} secondlabel={"Közzétéve"} />
                <div className="flex flex-row gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-2 h-[30px] bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                        <TbTrash className="w-5 h-5" />
                        <span>{deleting ? 'Törlés...' : 'Törlés'}</span>
                    </button>
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
        </>
    )
}
