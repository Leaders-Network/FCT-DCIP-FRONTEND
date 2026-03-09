"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PropertyPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to insurance page since property management is no longer available
    router.replace("/dashboard/insurance");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#028835] mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to Insurance...</p>
      </div>
    </div>
  );
};

export default PropertyPage;
