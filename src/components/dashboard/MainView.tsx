"use client"
import AdminDashboard from "../admin/AdminDashboard"
import UnifiedSurveyorDashboard from "../surveyor/UnifiedSurveyorDashboard"
import { useAuth } from "@/context/useAuth"
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

export default function MainView() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const role: RoleType | null = isEmployee(user) ? user.employeeRole.role : null;

  return (
    <>
      {role === 'Admin' || role === 'Super-admin' ? (
        <AdminDashboard />
      ) : role === 'Surveyor' ? (
        <UnifiedSurveyorDashboard />
      ) : (
        <div>Welcome!</div>
      )}
    </>
  )
}
