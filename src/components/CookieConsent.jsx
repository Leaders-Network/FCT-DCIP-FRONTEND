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

  // Show popup again after 24 hours (86400000 ms)
  const REPOPUP_DELAY = 86400000;

  useEffect(() => {
    const lastConsent = localStorage.getItem("cookieConsentTimestamp");

    if (!lastConsent || Date.now() - parseInt(lastConsent) > REPOPUP_DELAY) {
      const timer = setTimeout(() => {
        setShowConsent(true);
        setTimeout(() => setAnimate(true), 50);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeConsent = () => {
    setAnimate(false);
    setTimeout(() => setShowConsent(false), 300);
  };

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieConsentTimestamp", Date.now().toString());
    closeConsent();
  };

  const handleDeny = () => {
    localStorage.setItem("cookieConsent", "denied");
    localStorage.setItem("cookieConsentTimestamp", Date.now().toString());
    closeConsent();
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    localStorage.setItem("cookieConsentTimestamp", Date.now().toString());
    closeConsent();
    setShowPreferences(false);
  };

  if (!showConsent) return null;

  return (
    <>
      {/* ✅ Bottom Banner */}
      <div
        className={`fixed left-0 right-0 bottom-6 z-50 px-4 transition-transform duration-500 ease-out ${
          animate ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-6xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_-3px_15px_rgba(0,0,0,0.08)] rounded-xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Text Section */}
          <div className="text-sm text-gray-700 md:w-3/4 leading-relaxed">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Manage Cookie Consent
            </h2>
            <p className="text-gray-600">
              We use cookies to improve your browsing experience, personalize
              content, and analyze traffic. You can accept all, deny, or manage
              your preferences anytime.
            </p>
            <a
              href="/privacy-policy"
              className="inline-block mt-2 text-sm text-[#028835] hover:text-[#026c2a] underline transition-colors"
            >
              Privacy Policy
            </a>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch md:items-center justify-start md:justify-end gap-3 w-full md:w-auto">
            <button
              onClick={handleDeny}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Deny
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-[#028835] text-white font-medium hover:bg-[#026c2a] transition"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cookie Preferences
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose which types of cookies to allow. Essential cookies are
              always active for the website to function properly.
            </p>

            <div className="space-y-5">
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
                  checked
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
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Marketing</h3>
                  <p className="text-sm text-gray-600">
                    Used to deliver personalized ads and promotions.
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
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
              <button
                onClick={() => setShowPreferences(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[#028835] text-white font-medium hover:bg-[#026c2a] transition"
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
