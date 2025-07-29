import { getUserSession } from "@/actions/auth"
import { redirect } from "next/navigation"

export default async function AuthLayout({children}) {
    const response = await getUserSession();
    if (response?.user) {
        redirect("/")
    }
    return <>{children}</>
}