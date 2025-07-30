import AdminTermekekList from "./AdminProductList";
import AdminProductListSettings from "./AdminProductListSettings";

export default function AdminProductPage({ products }) {
  return (
    <>
    <AdminProductListSettings />
    <AdminTermekekList products={products} />
    </>
  );
}
