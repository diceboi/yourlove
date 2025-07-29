import AdminPageInner from "@/app/components/admin/AdminPageInner";
import { createClient } from "@/utils/supabase/server";

export default async function AdminPage() {

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")

  return (
    <AdminPageInner products={product} />
  )
}
