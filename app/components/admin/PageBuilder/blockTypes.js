// Block type definitions and default configurations

export const BLOCK_TYPES = {
  HERO: 'hero',
  PRODUCTS: 'products',
  TEXT: 'text',
  IMAGE: 'image',
  CTA: 'cta',
  GALLERY: 'gallery',
}

export const BLOCK_LABELS = {
  [BLOCK_TYPES.HERO]: 'Hero Section',
  [BLOCK_TYPES.PRODUCTS]: 'Termék Grid',
  [BLOCK_TYPES.TEXT]: 'Szöveges Blokk',
  [BLOCK_TYPES.IMAGE]: 'Kép',
  [BLOCK_TYPES.CTA]: 'CTA Gomb',
  [BLOCK_TYPES.GALLERY]: 'Galéria',
}

export const BLOCK_ICONS = {
  [BLOCK_TYPES.HERO]: 'TbLayoutHero',
  [BLOCK_TYPES.PRODUCTS]: 'TbShoppingBag',
  [BLOCK_TYPES.TEXT]: 'TbTextSize',
  [BLOCK_TYPES.IMAGE]: 'TbPhoto',
  [BLOCK_TYPES.CTA]: 'TbClick',
  [BLOCK_TYPES.GALLERY]: 'TbPhotoSensor',
}

export const DEFAULT_CONFIGS = {
  [BLOCK_TYPES.HERO]: {
    image: '',
    imageAlt: '',
    title: 'Főcím',
    text: 'Szöveg ide',
    ctaText: 'További info',
    ctaLink: '',
  },
  [BLOCK_TYPES.PRODUCTS]: {
    categoryPaths: [],
    tagIds: [],
    productIds: [],
    limit: 8,
    title: 'Termékek',
  },
  [BLOCK_TYPES.TEXT]: {
    content: [
      { type: 'paragraph', text: 'Írj ide...' }
    ]
  },
  [BLOCK_TYPES.IMAGE]: {
    image: '',
    imageAlt: '',
    caption: '',
  },
  [BLOCK_TYPES.CTA]: {
    text: 'Kattints ide',
    link: '',
    style: 'pink', // pink, green, black
  },
  [BLOCK_TYPES.GALLERY]: {
    images: [], // [{url, alt}]
  },
}

// Helper to create a new block
export function createBlock(type) {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    config: { ...DEFAULT_CONFIGS[type] },
  }
}
