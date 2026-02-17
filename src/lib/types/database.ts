export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingStatus =
  | "requested"
  | "held"
  | "approved"
  | "deposit_paid"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired"
  | "no_show";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          full_name: string;
          company_name: string | null;
          role: "client" | "admin";
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          full_name: string;
          company_name?: string | null;
          role?: "client" | "admin";
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          full_name?: string;
          company_name?: string | null;
          role?: "client" | "admin";
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          base_price: number;
          min_hours: number;
          extra_hour_price: number;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          base_price: number;
          min_hours?: number;
          extra_hour_price: number;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          min_hours?: number;
          extra_hour_price?: number;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      add_ons: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price: number;
          price_type: "flat" | "per_hour" | "percentage";
          compatible_services: string[];
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          price: number;
          price_type?: "flat" | "per_hour" | "percentage";
          compatible_services?: string[];
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          price?: number;
          price_type?: "flat" | "per_hour" | "percentage";
          compatible_services?: string[];
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          user_id: string | null;
          service_id: string;
          event_date: string;
          start_time: string;
          end_time: string;
          duration_hours: number;
          event_type: string | null;
          event_name: string | null;
          venue_name: string | null;
          venue_address: string | null;
          venue_zip: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          company_name: string | null;
          base_price: number;
          extra_hours_price: number;
          add_ons_price: number;
          travel_fee: number;
          travel_miles: number | null;
          discount_amount: number;
          discount_code: string | null;
          subtotal: number;
          tax_amount: number;
          total_price: number;
          deposit_amount: number;
          deposit_paid: boolean;
          deposit_paid_at: string | null;
          balance_due: number | null;
          balance_paid: boolean;
          status: BookingStatus;
          hold_expires_at: string | null;
          approved_at: string | null;
          approved_by: string | null;
          confirmed_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancellation_reason: string | null;
          referral_code_used: string | null;
          referred_by: string | null;
          client_notes: string | null;
          admin_notes: string | null;
          internal_notes: string | null;
          source: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_number: string;
          user_id?: string | null;
          service_id: string;
          event_date: string;
          start_time: string;
          end_time: string;
          duration_hours: number;
          event_type?: string | null;
          event_name?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_zip?: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          company_name?: string | null;
          base_price: number;
          extra_hours_price?: number;
          add_ons_price?: number;
          travel_fee?: number;
          travel_miles?: number | null;
          discount_amount?: number;
          discount_code?: string | null;
          subtotal: number;
          tax_amount?: number;
          total_price: number;
          deposit_amount: number;
          deposit_paid?: boolean;
          deposit_paid_at?: string | null;
          balance_due?: number | null;
          balance_paid?: boolean;
          status?: BookingStatus;
          hold_expires_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          referral_code_used?: string | null;
          referred_by?: string | null;
          client_notes?: string | null;
          admin_notes?: string | null;
          internal_notes?: string | null;
          source?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_number?: string;
          user_id?: string | null;
          service_id?: string;
          event_date?: string;
          start_time?: string;
          end_time?: string;
          duration_hours?: number;
          event_type?: string | null;
          event_name?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_zip?: string | null;
          contact_name?: string;
          contact_email?: string;
          contact_phone?: string;
          company_name?: string | null;
          base_price?: number;
          extra_hours_price?: number;
          add_ons_price?: number;
          travel_fee?: number;
          travel_miles?: number | null;
          discount_amount?: number;
          discount_code?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_price?: number;
          deposit_amount?: number;
          deposit_paid?: boolean;
          deposit_paid_at?: string | null;
          balance_due?: number | null;
          balance_paid?: boolean;
          status?: BookingStatus;
          hold_expires_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          confirmed_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
          referral_code_used?: string | null;
          referred_by?: string | null;
          client_notes?: string | null;
          admin_notes?: string | null;
          internal_notes?: string | null;
          source?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      booking_add_ons: {
        Row: {
          id: string;
          booking_id: string;
          add_on_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          add_on_id: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          add_on_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          service_id: string;
          slot_date: string;
          start_time: string;
          end_time: string;
          is_available: boolean;
          locked_until: string | null;
          locked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          slot_date: string;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          locked_until?: string | null;
          locked_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          slot_date?: string;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          locked_until?: string | null;
          locked_by?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          payment_type: "deposit" | "balance" | "refund";
          amount: number;
          status: "pending" | "processing" | "completed" | "failed" | "refunded";
          payment_method: string | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_charge_id: string | null;
          payment_link: string | null;
          paid_at: string | null;
          refunded_at: string | null;
          refund_amount: number | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          payment_type: "deposit" | "balance" | "refund";
          amount: number;
          status?: "pending" | "processing" | "completed" | "failed" | "refunded";
          payment_method?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_charge_id?: string | null;
          payment_link?: string | null;
          paid_at?: string | null;
          refunded_at?: string | null;
          refund_amount?: number | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          payment_type?: "deposit" | "balance" | "refund";
          amount?: number;
          status?: "pending" | "processing" | "completed" | "failed" | "refunded";
          payment_method?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_charge_id?: string | null;
          payment_link?: string | null;
          paid_at?: string | null;
          refunded_at?: string | null;
          refund_amount?: number | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referral_code: string;
          referred_booking_id: string | null;
          referred_user_id: string | null;
          status: "pending" | "qualified" | "paid" | "expired" | "invalid";
          payout_amount: number;
          payout_method: string | null;
          payout_reference: string | null;
          paid_at: string | null;
          paid_by: string | null;
          qualified_at: string | null;
          qualification_reason: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referral_code: string;
          referred_booking_id?: string | null;
          referred_user_id?: string | null;
          status?: "pending" | "qualified" | "paid" | "expired" | "invalid";
          payout_amount?: number;
          payout_method?: string | null;
          payout_reference?: string | null;
          paid_at?: string | null;
          paid_by?: string | null;
          qualified_at?: string | null;
          qualification_reason?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referral_code?: string;
          referred_booking_id?: string | null;
          referred_user_id?: string | null;
          status?: "pending" | "qualified" | "paid" | "expired" | "invalid";
          payout_amount?: number;
          payout_method?: string | null;
          payout_reference?: string | null;
          paid_at?: string | null;
          paid_by?: string | null;
          qualified_at?: string | null;
          qualification_reason?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sms_logs: {
        Row: {
          id: string;
          booking_id: string | null;
          user_id: string | null;
          phone_number: string;
          message_type: string;
          message_body: string;
          direction: "outbound" | "inbound";
          twilio_sid: string | null;
          status: string;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          user_id?: string | null;
          phone_number: string;
          message_type: string;
          message_body: string;
          direction?: "outbound" | "inbound";
          twilio_sid?: string | null;
          status?: string;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          user_id?: string | null;
          phone_number?: string;
          message_type?: string;
          message_body?: string;
          direction?: "outbound" | "inbound";
          twilio_sid?: string | null;
          status?: string;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor_id: string | null;
          actor_type: "user" | "system" | "cron";
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor_id?: string | null;
          actor_type?: "user" | "system" | "cron";
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          actor_id?: string | null;
          actor_type?: "user" | "system" | "cron";
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type AddOn = Database["public"]["Tables"]["add_ons"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingAddOn = Database["public"]["Tables"]["booking_add_ons"]["Row"];
export type TimeSlot = Database["public"]["Tables"]["time_slots"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type SmsLog = Database["public"]["Tables"]["sms_logs"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

// Extended types with relations
export type BookingWithService = Booking & {
  services: Service;
};

export type BookingWithAddOns = Booking & {
  booking_add_ons: (BookingAddOn & { add_ons: AddOn })[];
};

export type BookingFull = Booking & {
  services: Service;
  booking_add_ons: (BookingAddOn & { add_ons: AddOn })[];
  users: User | null;
};
