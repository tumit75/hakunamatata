import { ResortProvider } from "@/components/ResortProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { ExperiencePillars } from "@/components/site/ExperiencePillars";
import { Cottages } from "@/components/cottages/Cottages";
import { CottageDetail } from "@/components/cottages/CottageDetail";
import { Events } from "@/components/events/Events";
import { Restaurant } from "@/components/site/Restaurant";
import { Activities } from "@/components/site/Activities";
import { Location } from "@/components/site/Location";
import { Reviews } from "@/components/site/Reviews";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BookingDrawer } from "@/components/booking/BookingDrawer";
import { AdminPortal } from "@/components/admin/AdminPortal";
import { Concierge } from "@/components/concierge/Concierge";

export default function Home() {
  return (
    <ResortProvider>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ExperiencePillars />
        <Cottages />
        <Events />
        <Restaurant />
        <Activities />
        <Location />
        <Reviews />
      </main>
      <SiteFooter />

      <CottageDetail />
      <BookingDrawer />
      <AdminPortal />
      <Concierge />
    </ResortProvider>
  );
}
