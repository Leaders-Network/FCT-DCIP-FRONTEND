import RequireSession from "@/components/shared/RequireSession"

export default function UserAreaLayout({ children }: { children: React.ReactNode }) {
  return <RequireSession area="user">{children}</RequireSession>
}
