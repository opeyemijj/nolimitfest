import Hero from "@/components/home/Hero";
import EventsShowcase from "@/components/home/EventsShowcase";
import LineupTeaser from "@/components/home/LineupTeaser";
import StagePreview from "@/components/home/StagePreview";
import ExperienceGrid from "@/components/home/ExperienceGrid";
import VIPTeaser from "@/components/home/VIPTeaser";
import CitySelector from "@/components/home/CitySelector";
import FAQSection from "@/components/home/FAQSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <EventsShowcase />
      <LineupTeaser />
      <StagePreview />
      <VIPTeaser />
      <ExperienceGrid />
      <CitySelector />
      <FAQSection />
    </>
  );
}
