'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/app/components/UI/Modal'

export default function ProductModal() {
  const router = useRouter()

  return (
    <Modal openstate={true} onClose={() => router.back()}>
      <h2 className="text-xl font-bold mb-4">Termék szerkesztő</h2>
      <p>Itt fog megjelenni a termék szerkesztő tartalom.</p>
      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 rounded bg-amber-500 text-white"
      >
        Bezárás
      </button>
    </Modal>
  )
}
