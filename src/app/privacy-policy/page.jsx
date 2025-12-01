"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React, { useState } from "react";

const PrivacyPolicy = () => {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleToggle = (key) => {
    if (key === "essential") return; // essential cookies can't be disabled
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Placeholder: here you’d connect to backend or localStorage
    console.log("Preferences saved:", preferences);
    alert("Your cookie preferences have been updated.");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-gray-800">
      <Header />
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Privacy Policy
      </h1>

      <p className="text-gray-600 mb-8">
        Last updated: <strong>October 28, 2025</strong>
      </p>

      {/* ---------- MAIN PRIVACY CONTENT ---------- */}
      <section className="space-y-8 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            1. Introduction
          </h2>
          <p>
            At <strong>Builders-Liability-AMMC</strong>, we value your privacy and are
            committed to protecting your personal data. This Privacy Policy
            explains how we collect, use, store, and safeguard your information
            when you visit our website or use our services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Personal details like your name, email, and phone number</li>
            <li>
              Technical data such as IP address, browser type, and device info
            </li>
            <li>Usage data including pages visited and time spent on site</li>
            <li>Transaction data from purchases or form submissions</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>To provide and improve our services</li>
            <li>To communicate with you about updates or offers</li>
            <li>To personalize your user experience</li>
            <li>To comply with legal and regulatory obligations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            4. Cookies and Tracking
          </h2>
          <p>
            We use cookies to enhance your browsing experience. Cookies may be
            categorized as <strong>essential</strong>,{" "}
            <strong>analytics</strong>, or <strong>marketing</strong> cookies.
            You can manage your preferences below.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            5. Data Retention and Security
          </h2>
          <p>
            Your data is retained only as long as necessary for the purposes it
            was collected. We apply strong security measures to prevent
            unauthorized access or disclosure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            6. Contact Us
          </h2>
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
            <p>
              <strong>Email:</strong> support@yourcompany.com
            </p>
            <p>
              <strong>Address:</strong> 123 Innovation Drive, Lagos, Nigeria
            </p>
          </div>
        </div>
      </section>

      {/* ---------- PRIVACY PREFERENCE CENTER ---------- */}
      <div className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Privacy Preference Center
        </h2>
        <p className="text-gray-600 mb-6">
          You can review and manage your cookie preferences below. Some cookies
          are essential for the website to function properly and cannot be
          disabled.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold text-gray-800">Essential Cookies</h3>
              <p className="text-sm text-gray-500">
                Required for core functionality like security, authentication,
                and accessibility.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.essential}
              disabled
              className="w-5 h-5 accent-green-600 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold text-gray-800">Analytics Cookies</h3>
              <p className="text-sm text-gray-500">
                Help us understand how visitors use our site to improve
                performance.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={() => handleToggle("analytics")}
              className="w-5 h-5 accent-green-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold text-gray-800">
                Marketing Cookies
              </h3>
              <p className="text-sm text-gray-500">
                Used to deliver personalized ads and measure marketing campaign
                effectiveness.
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={() => handleToggle("marketing")}
              className="w-5 h-5 accent-green-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-[#028835] text-white px-6 py-2 rounded-lg hover:bg-[#026a2b] transition font-medium"
          >
            Save Preferences
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
