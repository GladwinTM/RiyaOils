"use client";

import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="py-16 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600">
        {error.message ||
          "The page could not finish loading. The store may be slow or offline."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </PageContainer>
  );
}
