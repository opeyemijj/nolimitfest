export type PassType = "Individual Pass" | "Table for 6" | "Table for 8" | "Table for 10";

export interface EOILead {
  id: string;
  eventName: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  passType: PassType | string;
  ticketTier?: string;
  ticketCount?: number;
  tableCount?: number;
  notes?: string;
  createdAt: string;
}

export function formatWhatsAppMessage(lead: Omit<EOILead, "id" | "createdAt">): string {
  const capacityMap: Record<string, string> = {
    "Individual Pass": "1 Guest",
    "Table for 6": "6 Guests",
    "Table for 8": "8 Guests",
    "Table for 10": "10 Guests (VVIP Cabana)",
  };

  const capacity = capacityMap[lead.passType] || lead.passType;

  return [
    `🔥 *NO LIMIT FEST - EXPRESSION OF INTEREST* 🔥`,
    `----------------------------------------`,
    `🎉 *Event:* ${lead.eventName}`,
    `🎟️ *Pass Type:* ${lead.passType}`,
    `👥 *Capacity / Table Size:* ${capacity}`,
    `👤 *Attendee Name:* ${lead.name}`,
    `📧 *Email:* ${lead.email}`,
    `📞 *Phone:* ${lead.phone}`,
    `💬 *WhatsApp:* ${lead.whatsapp}`,
    `📍 *Location:* ${lead.location}`,
    lead.notes ? `📝 *Special Requests:* ${lead.notes}` : null,
    `----------------------------------------`,
    `⚡ Submitted via NoLimitFest.com Official Portal`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

const STORAGE_KEY = "no_limit_fest_leads_v1";

export function saveLeadLocally(lead: Omit<EOILead, "id" | "createdAt">): EOILead {
  const newLead: EOILead = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const leads: EOILead[] = existingRaw ? JSON.parse(existingRaw) : [];
      leads.unshift(newLead);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error("Failed to save lead locally", e);
    }
  }

  return newLead;
}

export function getStoredLeads(): EOILead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to retrieve stored leads", e);
    return [];
  }
}

export function exportLeadsToCsv(leads: EOILead[]): void {
  if (!leads.length) return;
  const headers = ["ID", "Event", "Pass Type", "Name", "Email", "Phone", "WhatsApp", "Location", "Notes", "Date"];
  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.eventName.replace(/"/g, '""')}"`,
    `"${(l.passType || "").replace(/"/g, '""')}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.whatsapp.replace(/"/g, '""')}"`,
    `"${l.location.replace(/"/g, '""')}"`,
    `"${(l.notes || "").replace(/"/g, '""')}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `no_limit_fest_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
