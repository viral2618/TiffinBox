import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

export const metadata: Metadata = {
  title: "Profile | Sweet Bakery",
  description: "Manage your profile settings",
}

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
      <div className="pt-20">
        {children}
    </div>
  )
}