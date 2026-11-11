import type { ContactSettings } from "@/types/contact";

export function HomeContact({ contact }: { contact?: ContactSettings | null }) {
  if (!contact) return null;
  return (
    <section className="mt-16 rounded-[2rem] bg-cream p-8 text-center">
      <h2 className="font-display text-2xl">Visit us</h2>
      <p className="mt-3 text-sm text-zinc-700">{contact.address}</p>
      <p className="text-sm">{contact.phone}</p>
    </section>
  );
}
