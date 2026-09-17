import Hero from "@/components/home/Hero";
import EventsShowcase from "@/components/home/EventsShowcase";
import LineupTeaser from "@/components/home/LineupTeaser";
import ExperienceGrid from "@/components/home/ExperienceGrid";
import CitySelector from "@/components/home/CitySelector";
import FAQSection from "@/components/home/FAQSection";
import { getAllEvents, getTicketTiers, DbTicketTier } from "@/lib/data-service";

export default async function HomePage() {
  const events = await getAllEvents();
  const initialTiers: Record<string, DbTicketTier[]> = {};

  for (const evt of events) {
    initialTiers[evt.id] = await getTicketTiers(evt.id);
  }

  return (
    <>
      <Hero />
      <EventsShowcase events={events} initialTiers={initialTiers} />
      <LineupTeaser />
      <ExperienceGrid />
      <CitySelector />
      <FAQSection />
    </>
  );
}
