import ChatWidget from "@/components/ChatWidget"
import UserLayout from "./_components/UserLayout"
import RequireSession from "@/components/shared/RequireSession"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireSession area="user">
    <UserLayout>
      {children}
      <ChatWidget />
    </UserLayout>
  </RequireSession>
}