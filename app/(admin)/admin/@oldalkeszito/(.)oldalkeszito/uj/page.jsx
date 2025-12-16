import { createClient } from "@/utils/supabase/server"
import AdminPageBuilderModal from "@/app/components/admin/PageBuilder/AdminPageBuilderModal"

export default async function NewCustomPageModal() {
  return (
    <AdminPageBuilderModal 
      page={null}
      isNew={true}
    />
  )
}
