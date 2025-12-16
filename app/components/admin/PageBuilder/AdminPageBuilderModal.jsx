"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import PageBuilder from "./PageBuilder"
import { createClient } from "@/utils/supabase/client"
import { TbX, TbDeviceFloppy, TbEye } from "react-icons/tb"

function parseBlocks(value) {
  if (!value) return []
  try {
    if (typeof value === 'string') {
      return JSON.parse(value)
    }
    if (Array.isArray(value)) return value
  } catch (e) {
    console.error('Failed to parse blocks:', e)
  }
  return []
}

export default function AdminPageBuilderModal({ page, isNew }) {
  const router = useRouter()
  const supabase = createClient() // Client version is synchronous

  const initialBlocks = useMemo(() => {
    return parseBlocks(page?.tartalom)
  }, [page])

  const [blocks, setBlocks] = useState(initialBlocks)
  const [pageData, setPageData] = useState({
    cim: page?.cim || '',
    slug: page?.slug || '',
    meta_title: page?.meta_title || '',
    meta_leiras: page?.meta_leiras || '',
    kozzeteve: page?.kozzeteve || false,
  })
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...pageData,
        tartalom: JSON.stringify(blocks),
      }

      if (isNew) {
        const { error } = await supabase
          .from('custom_pages')
          .insert([payload])
          .select()
          .single()
        
        if (error) throw error
        toast.success('Oldal létrehozva!')
      } else {
        const { error } = await supabase
          .from('custom_pages')
          .update(payload)
          .eq('id', page.id)
        
        if (error) throw error
        toast.success('Oldal mentve!')
      }

      window.dispatchEvent(new CustomEvent('admin:custom_pages:changed'))
      router.back()
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Hiba történt a mentés során')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[#f5f5f5]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            >
              <TbX className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">
                {isNew ? 'Új oldal' : pageData.cim || 'Oldal szerkesztése'}
              </h1>
              <p className="text-sm text-gray-600">
                Húzd a blokkokat a vászonra és konfiguráld őket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <TbEye className="w-5 h-5" />
              <span>Előnézet</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--green)] hover:bg-[var(--green-hover)] text-white rounded-md transition-colors disabled:opacity-50"
            >
              <TbDeviceFloppy className="w-5 h-5" />
              <span>{saving ? 'Mentés...' : 'Mentés'}</span>
            </button>
          </div>
        </div>

        {/* Builder */}
        <PageBuilder
          blocks={blocks}
          setBlocks={setBlocks}
          pageData={pageData}
          setPageData={setPageData}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
        />
      </div>
    </div>
  )
}
