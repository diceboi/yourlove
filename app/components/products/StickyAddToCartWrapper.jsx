'use client'

import { useEffect, useRef, useState } from 'react'
import StickyAddToCart from '@/app/components/UI/StickyAddToCart'

/**
 * Wrapper component that manages the visibility of the sticky add-to-cart bar
 * Uses IntersectionObserver to detect when the main add-to-cart button scrolls out of view
 */
export default function StickyAddToCartWrapper({ product, children, targetRef }) {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    if (!targetRef?.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the target (ProductInfoPanel) is NOT visible
        setShowSticky(!entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    )

    observer.observe(targetRef.current)

    return () => {
      observer.disconnect()
    }
  }, [targetRef])

  return (
    <>
      {children}
      <StickyAddToCart
        productId={product.id}
        product={{
          name: `${product.fo_cim || ''} ${product.alcim || ''}`.trim(),
          price_huf: product.eladasi_ar_brutto,
          image_url: product.termekkep
        }}
        show={showSticky}
      />
    </>
  )
}
