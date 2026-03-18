import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dishes | Sweet Bakery",
  description: "Browse and discover delicious treats from local bakeries",
}

export default function DishesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}