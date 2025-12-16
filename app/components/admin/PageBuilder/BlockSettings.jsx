"use client"

import { BLOCK_TYPES } from "./blockTypes"
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput"
import Textarea from "@/app/components/UI/Inputfield/Textarea"
import HeroBlockSettings from "./blocks/HeroBlock/HeroBlockSettings"
import ProductsBlockSettings from "./blocks/ProductsBlock/ProductsBlockSettings"
import TextBlockSettings from "./blocks/TextBlock/TextBlockSettings"
import ImageBlockSettings from "./blocks/ImageBlock/ImageBlockSettings"
import CTABlockSettings from "./blocks/CTABlock/CTABlockSettings"
import GalleryBlockSettings from "./blocks/GalleryBlock/GalleryBlockSettings"

export default function BlockSettings({ block, pageData, setPageData, onUpdate }) {
  if (!block) {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2">Oldal beállítások</h3>
          <p className="text-sm text-gray-600 mb-4">
            Alapértelmezett beállítások az egész oldalra
          </p>
        </div>

        <SmallTextInput
          legend="Cím"
          name="cim"
          value={pageData.cim || ''}
          handleChange={(e) => setPageData({ ...pageData, cim: e.target.value })}
          placeholder="Oldal címe"
        />

        <SmallTextInput
          legend="URL Slug"
          name="slug"
          value={pageData.slug || ''}
          handleChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
          placeholder="url-cim"
        />

        <SmallTextInput
          legend="Meta Title (SEO)"
          name="meta_title"
          value={pageData.meta_title || ''}
          handleChange={(e) => setPageData({ ...pageData, meta_title: e.target.value })}
          placeholder="SEO cím"
        />

        <Textarea
          legend="Meta Description (SEO)"
          name="meta_leiras"
          value={pageData.meta_leiras || ''}
          handleChange={(e) => setPageData({ ...pageData, meta_leiras: e.target.value })}
          rows={3}
          placeholder="SEO leírás"
        />

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm">Közzététel</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Vázlat</span>
            <input
              type="checkbox"
              checked={pageData.kozzeteve || false}
              onChange={(e) => setPageData({ ...pageData, kozzeteve: e.target.checked })}
              className="w-10 h-6 bg-gray-200 checked:bg-[var(--green)] rounded-full relative cursor-pointer appearance-none transition-colors
                before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-transform
                checked:before:translate-x-4"
            />
            <span className="text-xs text-gray-600">Közzétéve</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Válassz ki egy blokkot a részletes beállításokhoz
          </p>
        </div>
      </div>
    )
  }

  const handleConfigChange = (newConfig) => {
    onUpdate(block.id, newConfig)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-1">Blokk beállítások</h3>
        <p className="text-sm text-gray-600">
          {block.type} blokk konfigurációja
        </p>
      </div>

      {block.type === BLOCK_TYPES.HERO && (
        <HeroBlockSettings config={block.config} onChange={handleConfigChange} />
      )}
      {block.type === BLOCK_TYPES.PRODUCTS && (
        <ProductsBlockSettings config={block.config} onChange={handleConfigChange} />
      )}
      {block.type === BLOCK_TYPES.TEXT && (
        <TextBlockSettings config={block.config} onChange={handleConfigChange} />
      )}
      {block.type === BLOCK_TYPES.IMAGE && (
        <ImageBlockSettings config={block.config} onChange={handleConfigChange} />
      )}
      {block.type === BLOCK_TYPES.CTA && (
        <CTABlockSettings config={block.config} onChange={handleConfigChange} />
      )}
      {block.type === BLOCK_TYPES.GALLERY && (
        <GalleryBlockSettings config={block.config} onChange={handleConfigChange} />
      )}
    </div>
  )
}
