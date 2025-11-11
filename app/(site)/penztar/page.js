export const dynamic = 'force-dynamic'

import Summary from '@/app/components/checkout/Summary'
import CheckoutForm from '@/app/components/checkout/CheckoutForm'
import H2 from '@/app/components/UI/Texts/H2'

export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-8 w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
    <H2 className="text-2xl font-semibold mb-4">Pénztár</H2>
    <div className='flex lg:flex-row flex-col-reverse gap-8 justify-center'>
      <CheckoutForm />
      <Summary />
      </div>
    </div>
  )
}
