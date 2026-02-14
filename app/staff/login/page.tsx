import { StaffLoginForm } from "@/components/auth/staff-login-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-card border border-border rounded-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-muted-foreground">Secure login for canteen staff</p>
          </div>

          <StaffLoginForm />
        </div>
      </div>
    </div>
  )
}
