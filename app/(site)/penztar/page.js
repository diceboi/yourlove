export const dynamic = 'force-dynamic'

import Summary from '@/app/components/checkout/Summary'
import CheckoutForm from '@/app/components/checkout/CheckoutForm'

export default function CheckoutPage() {
  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
    <div className='flex flex-row gap-8 justify-center'>
      <Summary />
      <CheckoutForm />
      </div>
    </div>
  )
}
