import UserLayout from "./_components/UserLayout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserLayout>{children}</UserLayout>
}