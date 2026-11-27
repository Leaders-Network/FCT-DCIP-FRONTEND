import Link from "next/link";
import type { Metadata } from "next";
import StatusPage, { primaryActionClass, secondaryActionClass } from "@/components/shared/StatusPage";

export const metadata: Metadata = {
  title: "Page not found | Builders Liability",
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="We can't find that page"
      body="The link may be old or mistyped. Go back to the home page, or sign in to reach your policies and assignments."
    >
      <Link href="/" className={primaryActionClass}>
        Go to the home page
      </Link>
      <Link href="/login" className={secondaryActionClass}>
        Sign in
      </Link>
    </StatusPage>
  );
}
