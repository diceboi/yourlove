"use client"

import { BLOCK_TYPES } from "./blockTypes"
import HeroBlockPreview from "./blocks/HeroBlock/HeroBlockPreview"
import ProductsBlockPreview from "./blocks/ProductsBlock/ProductsBlockPreview"
import TextBlockPreview from "./blocks/TextBlock/TextBlockPreview"
import ImageBlockPreview from "./blocks/ImageBlock/ImageBlockPreview"
import CTABlockPreview from "./blocks/CTABlock/CTABlockPreview"
import GalleryBlockPreview from "./blocks/GalleryBlock/GalleryBlockPreview"

export default function BlockRenderer({ block }) {
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
      return (
        <div className="p-4 bg-gray-100 rounded text-center text-gray-500">
          Ismeretlen blokk típus: {block.type}
        </div>
      )
  }
}
