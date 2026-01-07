import AdminSideMenu from "@/app/components/admin/AdminSideMenu";
import AdminCustomerEdit from "@/app/components/admin/AdminCustomerEdit";

export default async function AdminCustomerDetailsPage({ params }) {
  const { id } = await params;

  return (
    <div className="flex md:flex-row flex-col xl:mt-0 mt-20 md:h-[91vh] h-full bg-[var(--grey-bg)]">
      <AdminSideMenu />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
         <div className="flex-1 overflow-y-auto bg-[#f5f5f5]">
             <AdminCustomerEdit userId={id} />
         </div>
      </div>
    </div>
  );
}
