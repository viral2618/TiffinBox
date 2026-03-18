import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Favorites - When Fresh",
  description: "View your favorite shops and dishes",
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen mx-auto bg-background">
      {children}
    </section>
  )
}