import React from "react";
import Link from "next/link";

const RegistrationSuccess = () => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Registration Successful</h2>
      <p className="mb-4">The employee has been successfully registered.</p>
      <p className="mb-4">
        They will need to reset their password using the token sent to their
        email.
      </p>
      <Link href="/admin/dashboard" className="text-blue-500 hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default RegistrationSuccess;
