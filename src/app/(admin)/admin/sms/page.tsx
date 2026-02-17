"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Phone,
  User,
  Calendar,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// Mock data
const stats = {
  sentToday: 12,
  sentThisMonth: 156,
  deliveryRate: 98.5,
  responseRate: 45,
};

const templates = [
  {
    id: "booking_confirmation",
    name: "Booking Confirmation",
    message: "Hi {name}! Your booking #{booking_number} for {date} has been confirmed. We can't wait to capture the moment with you!",
    category: "booking",
  },
  {
    id: "deposit_reminder",
    name: "Deposit Reminder",
    message: "Hi {name}! Just a friendly reminder that your deposit of {amount} is due for booking #{booking_number}. Pay here: {link}",
    category: "payment",
  },
  {
    id: "event_reminder",
    name: "Event Reminder (24hr)",
    message: "Hi {name}! This is a reminder that your photo booth event is tomorrow at {time}. See you at {venue}!",
    category: "reminder",
  },
  {
    id: "hold_expiring",
    name: "Hold Expiring",
    message: "Hi {name}! Your date hold for {date} expires in 4 hours. Complete your booking here: {link}",
    category: "booking",
  },
  {
    id: "review_request",
    name: "Review Request",
    message: "Hi {name}! Thank you for choosing CTM! We'd love your feedback. Leave us a review: {link}",
    category: "marketing",
  },
];

const messageHistory = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    phone: "(555) 123-4567",
    message: "Hi Sarah! Your booking #CTM250042 for Feb 22 has been confirmed...",
    template: "Booking Confirmation",
    status: "delivered",
    sentAt: "2025-02-14 10:30 AM",
  },
  {
    id: "2",
    clientName: "David Park",
    phone: "(555) 567-8901",
    message: "Hi David! Your date hold for Feb 28 expires in 4 hours...",
    template: "Hold Expiring",
    status: "delivered",
    sentAt: "2025-02-13 2:15 PM",
  },
  {
    id: "3",
    clientName: "Tech Corp Inc.",
    phone: "(555) 345-6789",
    message: "Hi! Just a friendly reminder that your deposit of $224 is due...",
    template: "Deposit Reminder",
    status: "delivered",
    sentAt: "2025-02-13 9:00 AM",
  },
  {
    id: "4",
    clientName: "Corporate Events Co.",
    phone: "(555) 789-0123",
    message: "Hi! Thank you for choosing CTM! We'd love your feedback...",
    template: "Review Request",
    status: "failed",
    sentAt: "2025-02-12 11:45 AM",
    error: "Invalid phone number",
  },
  {
    id: "5",
    clientName: "Michael Chen",
    phone: "(555) 234-5678",
    message: "Hi Michael! This is a reminder that your photo booth event is tomorrow...",
    template: "Event Reminder (24hr)",
    status: "delivered",
    sentAt: "2025-02-19 10:00 AM",
  },
];

const clients = [
  { id: "1", name: "Sarah Johnson", phone: "(555) 123-4567", bookingNumber: "CTM250042" },
  { id: "2", name: "Michael Chen", phone: "(555) 234-5678", bookingNumber: "CTM250041" },
  { id: "3", name: "Tech Corp Inc.", phone: "(555) 345-6789", bookingNumber: "CTM250040" },
  { id: "4", name: "Emily Rodriguez", phone: "(555) 456-7890", bookingNumber: "CTM250039" },
  { id: "5", name: "David Park", phone: "(555) 567-8901", bookingNumber: "CTM250038" },
];

export default function SMSPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const selectedClientData = clients.find((c) => c.id === selectedClient);

  const filteredHistory = messageHistory.filter((msg) => {
    if (filterStatus !== "all" && msg.status !== filterStatus) return false;
    if (
      searchQuery &&
      !msg.clientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !msg.phone.includes(searchQuery)
    )
      return false;
    return true;
  });

  const handleSend = () => {
    if (!selectedClient) return;
    const message = selectedTemplateData?.message || customMessage;
    if (!message) return;

    alert(`SMS would be sent to ${selectedClientData?.name}:\n\n${message}`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">SMS Center</h1>
          <p className="text-neutral-400 mt-1">
            Send messages and view communication history
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.sentToday}</p>
              <p className="text-sm text-neutral-400">Sent Today</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.sentThisMonth}</p>
              <p className="text-sm text-neutral-400">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.deliveryRate}%</p>
              <p className="text-sm text-neutral-400">Delivery Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.responseRate}%</p>
              <p className="text-sm text-neutral-400">Response Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose message */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">Compose Message</h3>

            {/* Select client */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">
                Select Client
              </label>
              <select
                value={selectedClient || ""}
                onChange={(e) => setSelectedClient(e.target.value || null)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Select template */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">
                Message Template
              </label>
              <select
                value={selectedTemplate || ""}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value || null);
                  setCustomMessage("");
                }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Custom message</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message preview/edit */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-400 mb-2">
                Message {selectedTemplate ? "(Preview)" : ""}
              </label>
              <textarea
                value={selectedTemplateData?.message || customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                disabled={!!selectedTemplate}
                rows={4}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 resize-none"
                placeholder="Type your message..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                {(selectedTemplateData?.message || customMessage).length} / 160 characters
              </p>
            </div>

            <Button
              onClick={handleSend}
              disabled={!selectedClient || (!selectedTemplate && !customMessage)}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>

          {/* Quick templates */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">Quick Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setCustomMessage("");
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    selectedTemplate === template.id
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800"
                  )}
                >
                  <p className="font-medium text-white text-sm">
                    {template.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {template.message}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message history */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="p-4 border-b border-neutral-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto">
            {filteredHistory.map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-neutral-800/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{msg.clientName}</p>
                      <p className="text-sm text-neutral-500">{msg.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        msg.status === "delivered"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {msg.status === "delivered" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {msg.status === "delivered" ? "Delivered" : "Failed"}
                    </span>
                  </div>
                </div>
                <div className="ml-13 pl-13">
                  <p className="text-neutral-300 text-sm mb-2">{msg.message}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {msg.template}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.sentAt}
                    </span>
                  </div>
                  {msg.error && (
                    <p className="text-xs text-red-400 mt-2">Error: {msg.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-neutral-400">No messages found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
