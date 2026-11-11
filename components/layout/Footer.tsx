import Link from "next/link";
import { FloralDivider, Sunflower } from "@/components/decorations/Sunflower";
import { PageContainer } from "@/components/layout/PageContainer";
import type { ContactSettings } from "@/types/contact";

export function Footer({ contact }: { contact?: ContactSettings | null }) {
  return (
    <footer className="relative mt-16 overflow-hidden bg-[#f3ead0] pt-10">
      <Sunflower className="absolute -left-10 bottom-0 opacity-40" size={140} />
      <Sunflower className="absolute -right-8 top-4 rotate-12 opacity-40" size={120} />
      <PageContainer>
        <FloralDivider />
        <div className="relative z-10 grid gap-8 pb-12 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-riya">RIYA</p>
            <p className="mt-2 max-w-xs text-sm text-zinc-700">
              Pure oils for everyday kitchens.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase">Contact us</p>
            <div className="mt-3 space-y-1 text-sm">
              {contact?.phone ? <p>{contact.phone}</p> : null}
              {contact?.email ? <p>{contact.email}</p> : null}
              {contact?.address ? <p>{contact.address}</p> : null}
              {contact?.business_hours ? <p>{contact.business_hours}</p> : null}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {contact?.instagram_url ? (
              <a className="block underline" href={contact.instagram_url}>
                Instagram
              </a>
            ) : null}
            {contact?.whatsapp ? (
              <a
                className="block underline"
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
              >
                WhatsApp
              </a>
            ) : null}
            {contact?.google_maps_url ? (
              <a className="block underline" href={contact.google_maps_url}>
                Location
              </a>
            ) : null}
            <Link href="/track-order" className="block underline">
              Track order
            </Link>
            <Link href="/account" className="block underline">
              Account
            </Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
