"use client"
import AdminDashboard from "../admin/AdminDashboard"
import SurveyorDashboard from "../surveyor/SurveyorDashboard"
import { useAuth } from "@/context/useAuth"

export default function MainView() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const role = user.employeeRole?.role;

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
