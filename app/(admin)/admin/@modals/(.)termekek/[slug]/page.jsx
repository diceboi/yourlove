'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Modal from '@/app/components/UI/Modal'
import { createClient } from '@/utils/supabase/client'

export default function ProductModal({ params }) {
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seo_slug', params.slug)
        .single()

      if (data) setProduct(data)
      else console.error('Hiba:', error)
    }

    fetchProduct()
  }, [params.slug])

  return (
    <Modal openstate={true} onClose={() => router.back()}>
      <div className="p-4">
        {product ? (
          <>
            <h2>{product.fo_cim}</h2>
            <p>{product.termekleiras}</p>
          </>
        ) : (
          <p>Betöltés...</p>
        )}
        <button onClick={() => router.back()}>Bezárás</button>
      </div>
    </Modal>
  )
}
