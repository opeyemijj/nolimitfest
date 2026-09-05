export interface FAQItem {
  id: string;
  category: "Tickets & EOI" | "Venue & Travel" | "Festival Policies" | "VIP & Tables" | "Safety & Medical" | "Organizers & Tour";
  question: string;
  answer: string;
}

export const festivalFaqs: FAQItem[] = [
  {
    id: "dubai-date-venue",
    category: "Venue & Travel",
    question: "When and where is No Limit Fest Dubai 2026 taking place?",
    answer: "No Limit Fest Dubai takes place on Saturday 24th October 2026, from 6:00 PM till late at the iconic Helipad by Frozen Cherry in Dubai, UAE. The venue offers breathtaking panoramic sunset and skyline views, world-class acoustics, and an exclusive open-air festival experience.",
  },
  {
    id: "headliners-lineup",
    category: "Tickets & EOI",
    question: "Who are the headlining artists performing at No Limit Fest Dubai?",
    answer: "The premier Dubai edition is headlined by global Afrobeats sensations RUGER (chart-topper behind 'Asiwaju', 'Bounce', and 'Dior') and FIDO (hitmaker behind the viral sensation 'Awolowo'). Supporting international and regional guest DJs, percussionists, and entertainers will be announced in Phase 2.",
  },
  {
    id: "organizers-presenters",
    category: "Organizers & Tour",
    question: "Who are the official organizers behind No Limit Fest?",
    answer: "No Limit Fest is proudly organized and executive-produced by Shurlaybor Empire and Typical Naija. Both entertainment powerhouses bring unparalleled expertise in global music curation, urban culture experiences, and premier festival productions.",
  },
  {
    id: "pass-and-table-tiers",
    category: "VIP & Tables",
    question: "What pass categories and VIP table packages are available?",
    answer: "No Limit Fest offers 4 distinct pass and hospitality tiers: 1) Individual Pass (General Admission access to festival grounds and sunset bars); 2) Table for 6 (Reserved VIP lounge table with beverage credit and fast-track entry); 3) Table for 8 (Most popular prime center-tier table with unobstructed stage views and premium bottle service); and 4) Table for 10 (VVIP Helipad Deck Cabana with dedicated personal butler, vintage champagne, and backstage access).",
  },
  {
    id: "eoi-process",
    category: "Tickets & EOI",
    question: "How does the Expression of Interest (EOI) work and why submit via WhatsApp?",
    answer: "The Expression of Interest (EOI) form allows fans and VIP guests to secure priority allocation before general public sales open. When you submit your form (name, email, phone, location, and selected pass tier), your request is instantly formatted and transmitted to our festival concierge on WhatsApp (+971 50 889 4210) for personalized reservation assistance.",
  },
  {
    id: "gcc-tour-waitlist",
    category: "Organizers & Tour",
    question: "Which other cities are on the No Limit Fest World Tour itinerary?",
    answer: "Following the Dubai flagship, No Limit Fest has opened official waitlists for its Gulf expansion: Doha (Qatar), Muscat (Oman), Manama (Bahrain), and Riyadh (Saudi Arabia). Subsequent international tour stops include London (UK), Miami (USA), Lagos (Nigeria), and Tokyo (Japan).",
  },
  {
    id: "age-restriction",
    category: "Festival Policies",
    question: "What is the age restriction for No Limit Fest at Helipad by Frozen Cherry?",
    answer: "The event is strictly 21+ in accordance with UAE hospitality and venue licensing regulations. All guests must present an original valid government-issued photo ID or original passport at entry. Photocopies and digital phone images are strictly not accepted.",
  },
  {
    id: "getting-to-helipad",
    category: "Venue & Travel",
    question: "How do I reach Helipad by Frozen Cherry and what parking is available?",
    answer: "Helipad by Frozen Cherry is conveniently accessible from all major Dubai districts. Dedicated Careem and Uber drop-off and pick-up bays are established at the entrance. Complimentary valet parking is provided for Table for 8 and Table for 10 VIP holders, with self-parking facilities nearby.",
  },
  {
    id: "dress-code",
    category: "Festival Policies",
    question: "What is the dress code for No Limit Fest Dubai?",
    answer: "The dress code is Festival Chic / Smart Casual / Urban Glamour. Stylish festival fits, elevated streetwear, and trendy evening attire are encouraged. Athletic gym wear, flip-flops, and swimwear are not permitted.",
  },
  {
    id: "safety-medical",
    category: "Safety & Medical",
    question: "What safety, medical, and security protocols are in place?",
    answer: "No Limit Fest operates with comprehensive professional security screening, private security personnel, and licensed Dubai Health Authority (DHA) medical first-response teams on-site for the entire duration of the event from 6:00 PM till late.",
  },
];
