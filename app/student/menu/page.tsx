import { MenuBrowser } from "@/components/student/menu-browser"
import { StudentNav } from "@/components/student/student-nav"

export default function StudentMenuPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudentNav />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Menu</h1>
          <p className="text-muted-foreground">Order your favorite meals and skip the line</p>
        </div>
        <MenuBrowser />
      </main>
    </div>
  )
}
