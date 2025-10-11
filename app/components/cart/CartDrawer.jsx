
import CartDrawerClient from './CartDrawerClient'
import CartContent from './CartContent'
import CartFooter from './CartFooter'

export default function CartDrawer() {
  return <CartDrawerClient content={<CartContent />} footer={<CartFooter />} />
}
