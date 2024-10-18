import AuthLayout from "@/components/admin/AuthLayout";
import RegisterEmployee from "@/components/admin/RegisterEmployee";
import React from "react";

const page = () => {
  return (
    <div>
      <AuthLayout>
        <RegisterEmployee />
      </AuthLayout>
    </div>
  );
};

export default page;
