"use client";

// Prevent static generation - this page requires runtime features
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  User,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SmsTemplate {
  id: string;
  name: string;
  template: string;
}

interface SmsLog {
  id: string;
  phone_number: string;
  message_type: string;
  message_body: string;
  status: string;
  error_message: string | null;
  created_at: string;
  bookings?: {
    booking_number: string;
    contact_name: string;
  } | null;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  bookingNumber: string;
  bookingId: string;
}

interface SmsStats {
  sentToday: number;
  sentThisMonth: number;
  deliveryRate: number;
  failedCount: number;
}

function SmsPageContent() {
  const searchParams = useSearchParams();
  const preselectedBookingId = searchParams.get("booking");

  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [stats, setStats] = useState<SmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesRes, logsRes] = await Promise.all([
        fetch("/api/admin/sms/send"),
        fetch("/api/admin/sms"),
      ]);

      const templatesData = await templatesRes.json();
      const logsData = await logsRes.json();

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }

      if (logsData.success) {
        setLogs(logsData.logs);
        setStats(logsData.stats);
        setClients(logsData.clients || []);
      }

      // Pre-select client if booking ID is provided
      if (preselectedBookingId && logsData.clients) {
        const client = logsData.clients.find(
          (c: Client) => c.bookingId === preselectedBookingId
        );
        if (client) {
          setSelectedClient(client.id);
        }
      }
    } catch (error) {
      console.error("Error fetching SMS data:", error);
    } finally {
      setLoading(false);
    }
  }, [preselectedBookingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const selectedClientData = clients.find((c) => c.id === selectedClient);

  const filteredLogs = logs.filter((log) => {
    if (filterStatus !== "all" && log.status !== filterStatus) return false;
    if (
      searchQuery &&
      !log.bookings?.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.phone_number.includes(searchQuery)
    )
      return false;
    return true;
  });

  const handleSend = async () => {
    if (!selectedClientData) return;
    const message = selectedTemplateData?.template || customMessage;
    if (!message) return;

    setSending(true);
    try {
      const response = await fetch("/api/admin/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedClientData.phone,
          template: selectedTemplate || undefined,
          message: selectedTemplate ? undefined : customMessage,
          variables: {
            name: selectedClientData.name.split(" ")[0],
            booking_number: selectedClientData.bookingNumber,
          },
          bookingId: selectedClientData.bookingId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("SMS sent successfully!");
        setCustomMessage("");
        setSelectedTemplate(null);
        fetchData();
      } else {
        alert(`Failed to send SMS: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      alert("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

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
      {stats && (
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
                <p className="text-2xl font-bold text-white">
                  {stats.sentThisMonth}
                </p>
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
                <p className="text-2xl font-bold text-white">
                  {stats.deliveryRate}%
                </p>
                <p className="text-sm text-neutral-400">Delivery Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.failedCount}
                </p>
                <p className="text-sm text-neutral-400">Failed</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                value={selectedTemplateData?.template || customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                disabled={!!selectedTemplate}
                rows={4}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 resize-none"
                placeholder="Type your message..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                {(selectedTemplateData?.template || customMessage).length} / 160
                characters
              </p>
            </div>

            <Button
              onClick={handleSend}
              disabled={
                !selectedClient ||
                (!selectedTemplate && !customMessage) ||
                sending
              }
              className="w-full"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </div>

          {/* Quick templates */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">Quick Templates</h3>
            <div className="space-y-2">
              {templates.slice(0, 5).map((template) => (
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
                    {template.template}
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
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
              <button
                onClick={fetchData}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-400">No messages found.</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {log.bookings?.contact_name || "Unknown"}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {log.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          log.status === "delivered" || log.status === "sent"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : log.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-neutral-500/20 text-neutral-400"
                        )}
                      >
                        {log.status === "delivered" || log.status === "sent" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : log.status === "failed" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-13 pl-13">
                    <p className="text-neutral-300 text-sm mb-2">
                      {log.message_body}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {log.message_type.replace(/_/g, " ")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-red-400 mt-2">
                        Error: {log.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SMSPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      }
    >
      <SmsPageContent />
    </Suspense>
  );
}
