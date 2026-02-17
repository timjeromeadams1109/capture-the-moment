import type { Service, AddOn } from "./database";

export interface BookingFormData {
  // Step 1: Service & Date
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  eventDate: string;
  startTime: string;
  durationHours: number;

  // Step 2: Add-ons
  selectedAddOns: SelectedAddOn[];

  // Step 3: Event Details
  eventType: string;
  eventName: string;
  venueName: string;
  venueAddress: string;
  venueZip: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  clientNotes: string;

  // Step 4: Referral
  referralCode: string;
}

export interface SelectedAddOn {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PricingBreakdown {
  basePrice: number;
  extraHoursPrice: number;
  extraHours: number;
  addOnsPrice: number;
  travelFee: number;
  travelMiles: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  totalPrice: number;
  depositAmount: number;
  items: PricingLineItem[];
}

export interface PricingLineItem {
  label: string;
  amount: number;
  type: "base" | "addon" | "fee" | "discount";
}

export interface TimeSlot {
  time: string;
  available: boolean;
  label: string;
}

export interface AvailabilityResponse {
  date: string;
  serviceId: string;
  slots: TimeSlot[];
  fullyBooked: boolean;
}

export const EVENT_TYPES = [
  "Corporate Event",
  "Wedding",
  "Birthday Party",
  "Anniversary",
  "Holiday Party",
  "Product Launch",
  "Grand Opening",
  "Graduation",
  "Quinceañera",
  "Bar/Bat Mitzvah",
  "Fundraiser",
  "Other",
] as const;

export const DURATION_OPTIONS = [
  { value: 2, label: "2 hours", extra: 0 },
  { value: 3, label: "3 hours", extra: 1 },
  { value: 4, label: "4 hours", extra: 2 },
  { value: 5, label: "5 hours", extra: 3 },
  { value: 6, label: "6 hours", extra: 4 },
] as const;

export const TIME_SLOTS = [
  { time: "10:00", label: "10:00 AM" },
  { time: "11:00", label: "11:00 AM" },
  { time: "12:00", label: "12:00 PM" },
  { time: "13:00", label: "1:00 PM" },
  { time: "14:00", label: "2:00 PM" },
  { time: "15:00", label: "3:00 PM" },
  { time: "16:00", label: "4:00 PM" },
  { time: "17:00", label: "5:00 PM" },
  { time: "18:00", label: "6:00 PM" },
  { time: "19:00", label: "7:00 PM" },
  { time: "20:00", label: "8:00 PM" },
] as const;

export const INITIAL_BOOKING_DATA: BookingFormData = {
  serviceId: "",
  serviceName: "",
  serviceSlug: "",
  eventDate: "",
  startTime: "",
  durationHours: 2,
  selectedAddOns: [],
  eventType: "",
  eventName: "",
  venueName: "",
  venueAddress: "",
  venueZip: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  companyName: "",
  clientNotes: "",
  referralCode: "",
};
