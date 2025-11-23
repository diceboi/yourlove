import CheckoutStepper from '@/app/components/checkout/CheckoutForm'
import Summary from '@/app/components/checkout/Summary'
import H2 from '@/app/components/UI/Texts/H2'
import { createClient } from '@/utils/supabase/server'

export default async function CheckoutPage() {
  const supabase = await createClient()

  // aktuális user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let addresses = []
  let defaultAddress = null

  if (user) {
    // user_profiles
    const { data: profData, error: profErr } = await supabase
      .from('user_profiles')
      .select('firstname, lastname, email, phone')
      .eq('id', user.id)
      .single()

    if (!profErr && profData) {
      profile = profData
    }

    // user_addresses
    const { data: addrData, error: addrErr } = await supabase
      .from('user_addresses')
      .select('id, label, firstname, lastname, country, zip, city, line1, phone, is_default')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!addrErr && addrData) {
      addresses = addrData
      defaultAddress =
        addrData.find(a => a.is_default) ||
        addrData[0] ||
        null
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <H2 className="text-2xl font-semibold mb-4">Pénztár</H2>
      <div className='flex lg:flex-row flex-col-reverse gap-8 justify-center'>
        <CheckoutStepper
          initialProfile={profile}
          savedAddresses={addresses}
          defaultAddress={defaultAddress}
        />
        <Summary />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
