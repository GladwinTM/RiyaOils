import { PageContainer } from "@/components/layout/PageContainer";
import { BackendNotice } from "@/components/ui/BackendNotice";
import { apiSafe } from "@/lib/api.server";
import type { ContactSettings } from "@/types/contact";

export default async function ContactPage() {
  const result = await apiSafe<ContactSettings | null>("/content/contact", null);

  return (
    <PageContainer className="py-10">
      <h1 className="font-display text-4xl">Contact</h1>
      <div className="mt-6">
        <BackendNotice message={result.ok ? null : result.error} />
      </div>
      {!result.data ? (
        <p className="mt-2 text-zinc-600">
          We couldn&apos;t load contact details right now. Please try again shortly.
        </p>
      ) : (
        <div className="mt-2 max-w-xl space-y-2 rounded-2xl bg-white p-6 text-sm">
          <p className="text-lg font-medium">{result.data.business_name}</p>
          {result.data.phone ? <p>Phone: {result.data.phone}</p> : null}
          {result.data.email ? <p>Email: {result.data.email}</p> : null}
          {result.data.whatsapp ? <p>WhatsApp: {result.data.whatsapp}</p> : null}
          {result.data.address ? <p>Address: {result.data.address}</p> : null}
          {result.data.business_hours ? (
            <p>Hours: {result.data.business_hours}</p>
          ) : null}
          {result.data.instagram_url ? (
            <p>
              <a className="underline" href={result.data.instagram_url}>
                Instagram
              </a>
            </p>
          ) : null}
          {result.data.facebook_url ? (
            <p>
              <a className="underline" href={result.data.facebook_url}>
                Facebook
              </a>
            </p>
          ) : null}
          {result.data.google_maps_url ? (
            <div className="pt-4">
              <iframe
                title="Store location"
                src={result.data.google_maps_url}
                className="h-64 w-full rounded-xl border-0"
              />
            </div>
          ) : null}
        </div>
      )}
    </PageContainer>
  );
}
