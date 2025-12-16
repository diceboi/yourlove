import { BLOCK_TYPES } from "@/app/components/admin/PageBuilder/blockTypes"
import HeroBlockPublic from "@/app/components/admin/PageBuilder/blocks/HeroBlock/HeroBlockPublic"
import ProductsBlockPublic from "@/app/components/admin/PageBuilder/blocks/ProductsBlock/ProductsBlockPublic"
import TextBlockPublic from "@/app/components/admin/PageBuilder/blocks/TextBlock/TextBlockPublic"
import ImageBlockPublic from "@/app/components/admin/PageBuilder/blocks/ImageBlock/ImageBlockPublic"
import CTABlockPublic from "@/app/components/admin/PageBuilder/blocks/CTABlock/CTABlockPublic"
import GalleryBlockPublic from "@/app/components/admin/PageBuilder/blocks/GalleryBlock/GalleryBlockPublic"

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

async function BlockRenderer({ block }) {
  switch (block.type) {
    case BLOCK_TYPES.HERO:
      return <HeroBlockPublic config={block.config} />
    case BLOCK_TYPES.PRODUCTS:
      return <ProductsBlockPublic config={block.config} />
    case BLOCK_TYPES.TEXT:
      return <TextBlockPublic config={block.config} />
    case BLOCK_TYPES.IMAGE:
      return <ImageBlockPublic config={block.config} />
    case BLOCK_TYPES.CTA:
      return <CTABlockPublic config={block.config} />
    case BLOCK_TYPES.GALLERY:
      return <GalleryBlockPublic config={block.config} />
    default:
      return null
  }
}

export default async function CustomPageTemplate({ page }) {
  const blocks = parseBlocks(page.tartalom)

  return (
    <div className="w-full">
      {blocks.length === 0 ? (
        <div className="py-32 text-center text-gray-500">
          Ez az oldal még üres
        </div>
      ) : (
        <>
          {blocks.map(async (block, index) => (
            <BlockRenderer key={block.id || index} block={block} />
          ))}
        </>
      )}
    </div>
  )
}
