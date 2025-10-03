import React from "react";
import AdminLayout from "./usersComponent/AdminLayout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // Mock user data - in a real app, this would come from your auth context
  const user = {
    firstname: "Paul",
    lastname: "Blessing",
    email: "paul.blessing@example.com",
    role: "Super Admin",
  };

  return (
    <AdminLayout user={user}>
      {children}
    </AdminLayout>
  );
};

export default Layout;
