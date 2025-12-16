"use client"

import { useState } from "react"
import { BLOCK_TYPES } from "./blockTypes"
import { TbX, TbDeviceDesktop, TbDeviceTablet, TbDeviceMobile } from "react-icons/tb"
import HeroBlockPreview from "./blocks/HeroBlock/HeroBlockPreview"
import ProductsBlockPreview from "./blocks/ProductsBlock/ProductsBlockPreview"
import TextBlockPreview from "./blocks/TextBlock/TextBlockPreview"
import ImageBlockPreview from "./blocks/ImageBlock/ImageBlockPreview"
import CTABlockPreview from "./blocks/CTABlock/CTABlockPreview"
import GalleryBlockPreview from "./blocks/GalleryBlock/GalleryBlockPreview"

function BlockPreviewRenderer({ block }) {
  switch (block.type) {
    case BLOCK_TYPES.HERO:
      return <HeroBlockPreview config={block.config} />
    case BLOCK_TYPES.PRODUCTS:
      return <ProductsBlockPreview config={block.config} />
    case BLOCK_TYPES.TEXT:
      return <TextBlockPreview config={block.config} />
    case BLOCK_TYPES.IMAGE:
      return <ImageBlockPreview config={block.config} />
    case BLOCK_TYPES.CTA:
      return <CTABlockPreview config={block.config} />
    case BLOCK_TYPES.GALLERY:
      return <GalleryBlockPreview config={block.config} />
    default:
      return null
  }
}

export default function LivePreviewModal({ blocks, pageData, onClose }) {
  const [device, setDevice] = useState('desktop') // desktop, tablet, mobile

  const deviceWidths = {
    desktop: 'max-w-full',
    tablet: 'max-w-3xl',
    mobile: 'max-w-md',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
        <div>
          <h2 className="text-xl font-bold">{pageData.cim || 'Előnézet'}</h2>
          <p className="text-sm text-gray-400">Előnézet mód - a termékek placeholder-ek</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Device Toggle */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded ${device === 'desktop' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              title="Desktop"
            >
              <TbDeviceDesktop className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded ${device === 'tablet' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              title="Tablet"
            >
              <TbDeviceTablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded ${device === 'mobile' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              title="Mobile"
            >
              <TbDeviceMobile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <TbX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
        <div className={`${deviceWidths[device]} mx-auto bg-white shadow-2xl`}>
          {blocks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nincs még blokk az oldalon
            </div>
          ) : (
            <div className="space-y-0">
              {blocks.map((block) => (
                <div key={block.id} className="border-b border-gray-100 last:border-0">
                  <BlockPreviewRenderer block={block} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
