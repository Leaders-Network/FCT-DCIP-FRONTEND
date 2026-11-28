"use client";

import { useEffect } from "react";
import Link from "next/link";
import StatusPage, { primaryActionClass, secondaryActionClass } from "@/components/shared/StatusPage";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code={error.digest ? `Error ${error.digest}` : "Something went wrong"}
      title="This page stopped working"
      body="Something went wrong while showing this page. Try again, and if it keeps happening, go back to the home page."
    >
      <button type="button" onClick={reset} className={primaryActionClass}>
        Try again
      </button>
      <Link href="/" className={secondaryActionClass}>
        Go to the home page
      </Link>
    </StatusPage>
  );
}
