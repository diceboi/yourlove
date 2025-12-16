"use client"

import { useState } from "react"
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput"
import Textarea from "@/app/components/UI/Inputfield/Textarea"
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal"
import Image from "next/image"

export default function HeroBlockSettings({ config, onChange }) {
  const [mediaOpen, setMediaOpen] = useState(false)

  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value })
  }

  return (
    <div className="space-y-4">
      {mediaOpen && (
        <MediaLibraryModal
          isOpen={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onSelect={(img) => {
            if (img) handleChange('image', img)
            setMediaOpen(false)
          }}
        />
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Háttérkép</label>
        <div 
          onClick={() => setMediaOpen(true)}
          className="relative w-full h-32 bg-gray-100 rounded border-2 border-dashed border-gray-300 cursor-pointer hover:border-[var(--pink)] transition-colors overflow-hidden"
        >
          {config.image ? (
            <Image src={config.image} alt="" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Kattints a kép kiválasztásához
            </div>
          )}
        </div>
      </div>

      <SmallTextInput
        legend="Kép alt szöveg"
        value={config.imageAlt || ''}
        handleChange={(e) => handleChange('imageAlt', e.target.value)}
        placeholder="Kép leírása"
      />

      <SmallTextInput
        legend="Főcím"
        value={config.title || ''}
        handleChange={(e) => handleChange('title', e.target.value)}
        placeholder="Főcím"
      />

      <Textarea
        legend="Szöveg"
        value={config.text || ''}
        handleChange={(e) => handleChange('text', e.target.value)}
        rows={3}
        placeholder="Hero szöveg"
      />

      <SmallTextInput
        legend="CTA gomb szöveg"
        value={config.ctaText || ''}
        handleChange={(e) => handleChange('ctaText', e.target.value)}
        placeholder="Kattints ide"
      />

      <SmallTextInput
        legend="CTA link"
        value={config.ctaLink || ''}
        handleChange={(e) => handleChange('ctaLink', e.target.value)}
        placeholder="/shop"
      />
    </div>
  )
}
