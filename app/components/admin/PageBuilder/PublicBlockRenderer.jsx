import HeroBlockPublic from "@/app/components/admin/PageBuilder/blocks/HeroBlock/HeroBlockPublic"
import ProductsBlockPublic from "@/app/components/admin/PageBuilder/blocks/ProductsBlock/ProductsBlockPublic"
import TextBlockPublic from "@/app/components/admin/PageBuilder/blocks/TextBlock/TextBlockPublic"
import ImageBlockPublic from "@/app/components/admin/PageBuilder/blocks/ImageBlock/ImageBlockPublic"
import CTABlockPublic from "@/app/components/admin/PageBuilder/blocks/CTABlock/CTABlockPublic"
import GalleryBlockPublic from "@/app/components/admin/PageBuilder/blocks/GalleryBlock/GalleryBlockPublic"
import { BLOCK_TYPES } from "@/app/components/admin/PageBuilder/blockTypes"

export default async function PublicBlockRenderer({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`
        
        switch (block.type) {
          case BLOCK_TYPES.HERO:
            return <HeroBlockPublic key={key} config={block.config} />
          
          case BLOCK_TYPES.PRODUCTS:
            return <ProductsBlockPublic key={key} config={block.config} />
          
          case BLOCK_TYPES.TEXT:
            return <TextBlockPublic key={key} config={block.config} />
          
          case BLOCK_TYPES.IMAGE:
            return <ImageBlockPublic key={key} config={block.config} />
          
          case BLOCK_TYPES.CTA:
            return <CTABlockPublic key={key} config={block.config} />
          
          case BLOCK_TYPES.GALLERY:
            return <GalleryBlockPublic key={key} config={block.config} />
          
          default:
            console.warn(`Unknown block type: ${block.type}`)
            return null
        }
      })}
    </div>
  )
}
