"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConsent(true);
      setTimeout(() => setAnimate(true), 50);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    setAnimate(false);
    setTimeout(() => setShowConsent(false), 300);
  };

  const handleDeny = () => {
    setAnimate(false);
    setTimeout(() => setShowConsent(false), 300);
  };

  const handleSavePreferences = () => {
    setShowPreferences(false);
    setAnimate(false);
    setTimeout(() => setShowConsent(false), 300);
  };

  if (!showConsent) return null;

  return (
    <>
      {/* Bottom Banner */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-transform duration-500 ease-out ${
          animate ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-6xl bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-3px_15px_rgba(0,0,0,0.08)] px-6 py-5 md:px-10 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-gray-700 md:w-3/4 leading-relaxed">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Manage Cookie Consent
            </h2>
            <p className="text-gray-600">
              To provide the best experiences, we use technologies like cookies
              to store and/or access device information. Consenting to these
              technologies allows us to process data such as browsing behavior
              or unique IDs on this site. Not consenting or withdrawing consent
              may adversely affect certain features and functions.
            </p>
            <a
              href="/privacy-policy"
              className="inline-block mt-2 text-sm text-gray-500 hover:text-[#028835] underline transition-colors"
            >
              Privacy Policy
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
            <button
              onClick={handleDeny}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Deny
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 rounded-lg bg-[#028835] text-white font-medium hover:bg-[#026c2a] transition"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cookie Preferences
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You can choose which categories of cookies you allow. Essential
              cookies are always enabled as they are necessary for the website
              to function properly.
            </p>

            <div className="space-y-4">
              {/* Essential */}
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="font-medium text-gray-800">Essential</h3>
                  <p className="text-sm text-gray-600">
                    Required for basic site functionality and security.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-5 w-5 accent-[#028835] cursor-not-allowed"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="font-medium text-gray-800">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Helps us understand how visitors interact with our site.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      analytics: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-[#028835] cursor-pointer"
                />
              </div>

              {/* Marketing */}
              {/* <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Marketing</h3>
                  <p className="text-sm text-gray-600">
                    Used to personalize advertising and measure its
                    effectiveness.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      marketing: e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-[#028835] cursor-pointer"
                />
              </div> */}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 rounded-lg bg-[#028835] text-white font-medium hover:bg-[#026c2a] transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
