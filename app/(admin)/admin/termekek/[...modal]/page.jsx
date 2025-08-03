'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Modal from '@/app/components/UI/Modal'

export default function AdminTermekModalPage({ params }) {
  const router = useRouter()

  const handleClose = () => {
    router.back()
  }

  const type = params.modal?.[0] // 'uj' vagy 'szerkesztes'
  const id = params.modal?.[1]   // ha van, pl. termék ID

  return (
    <Modal openstate={true} onClose={handleClose}>
      {type === 'uj' && 
      <div>Új termék</div>
      }
      {type === 'szerkesztes' && 
      <div>Szerkesztés termék</div>
      }
    </Modal>
  )
}
