"use client";
import React, { useEffect, useState } from "react";
import UnderwriterAdminManagement from "@/components/admin/UnderwriterAdminManagement";
import { hasAccessLevel, getAuthToken } from "@/utils/auth";

export default function UnderwriterAdministratorsPage() {
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        // Only super-admins may access this page; otherwise show placeholder
        const superAdminToken = getAuthToken("super-admin");
        const allowed = Boolean(superAdminToken) && hasAccessLevel("super-admin");
        setIsAllowed(allowed);
        setIsChecking(false);
    }, []);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-600">Checking access…</div>
            </div>
        );
    }

    if (!isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow-md rounded-lg p-6 text-center max-w-lg space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">Underwriter Admin Management</h2>
                    <p className="text-sm text-gray-700">
                        This page is reserved for managing underwriter administrators on the platform.
                    </p>
                    <p className="text-sm text-gray-600">
                        If an underwriter needs to be registered or onboarded, please contact the Gladfaith team to initiate the process.
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                        Access is restricted to Super Admins. Please sign in with a super-admin account to proceed.
                    </p>
                </div>
            </div>
        );
    }

    return <UnderwriterAdminManagement />;
}
