"use client"
import AdminDashboard from "../admin/AdminDashboard"
import SurveyorDashboard from "../surveyor/SurveyorDashboard"
import { useAuth } from "@/context/useAuth"

export default function MainView() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const role = user && 'employeeRole' in user && user.employeeRole && typeof user.employeeRole === 'object' && 'role' in user.employeeRole
    ? user.employeeRole.role
    : null;

  return (
    <>
      {role === 'Admin' || role === 'Super-admin' ? (
        <AdminDashboard />
      ) : role === 'Surveyor' ? (
        <SurveyorDashboard />
      ) : (
        <div>Welcome!</div>
      )}
    </>
  )
}
