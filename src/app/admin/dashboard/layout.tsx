import Layout from "@/components/dashboard/Layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
