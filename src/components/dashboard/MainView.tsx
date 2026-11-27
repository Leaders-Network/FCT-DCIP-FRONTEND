"use client"
import Link from "next/link"
import { ShieldAlert, UserX } from "lucide-react"
import AdminDashboard from "../admin/AdminDashboard"
import UnifiedSurveyorDashboard from "../surveyor/UnifiedSurveyorDashboard"
import { useAuth } from "@/context/useAuth"
import { clearAuthTokens } from "@/utils/auth"
import { Employee, RoleType } from "@/types/api.types"

function isEmployee(user: unknown): user is Employee {
  return (
    typeof user === 'object' &&
    user !== null &&
    'employeeRole' in user &&
    typeof (user as Employee).employeeRole === 'object' &&
    (user as Employee).employeeRole !== null &&
    'role' in (user as Employee).employeeRole
  );
}

interface NoticeProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  action: React.ReactNode
}

function DashboardNotice({ icon: Icon, title, body, action }: NoticeProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{body}</p>
      </div>
      {action}
    </div>
  )
}

const signInAgainClass =
  "inline-flex items-center rounded-lg bg-[#028835] px-4 py-2 text-sm font-semibold text-white hover:bg-[#026c2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#028835] focus-visible:ring-offset-2"

export default function MainView() {
  const { user } = useAuth();

  // The layout has already confirmed a staff token exists. A missing profile
  // means the stored account details expired or were cleared, so the page
  // cannot tell which dashboard to show.
  if (!user) {
    return (
      <DashboardNotice
        icon={UserX}
        title="Your account details are missing"
        body="Your sign-in has expired or your browser cleared its saved details. Sign in again to open the dashboard."
        action={
          <Link href="/admin/login" onClick={() => clearAuthTokens()} className={signInAgainClass}>
            Sign in again
          </Link>
        }
      />
    );
  }

  const role: RoleType | null = isEmployee(user) ? user.employeeRole.role : null;

  if (role === 'Admin' || role === 'Super-admin') {
    return <AdminDashboard />;
  }

  if (role === 'Surveyor') {
    return <UnifiedSurveyorDashboard />;
  }

  return (
    <DashboardNotice
      icon={ShieldAlert}
      title="This dashboard is for AMMC administrators"
      body="Your account does not have an administrator or surveyor role. If you think this is wrong, ask an AMMC administrator to check your role."
      action={
        <Link href="/" className="text-sm font-semibold text-[#028835] hover:underline">
          Go to the home page
        </Link>
      }
    />
  );
}
