"use client";

import { useState } from "react";
import {
  Users,
  Gift,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
  Search,
  Plus,
  TrendingUp,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

// Mock data
const stats = {
  totalReferrers: 12,
  activeReferrers: 8,
  totalReferrals: 24,
  convertedReferrals: 18,
  totalPaidOut: 450,
  pendingPayouts: 100,
  conversionRate: 75,
};

const referrers = [
  {
    id: "1",
    name: "Jessica Martinez",
    email: "jessica@email.com",
    phone: "(555) 111-2222",
    code: "JESSICA50",
    referrals: 5,
    converted: 4,
    totalEarned: 200,
    pendingPayout: 50,
    status: "active",
    createdAt: "2024-11-15",
  },
  {
    id: "2",
    name: "Robert Kim",
    email: "robert@email.com",
    phone: "(555) 222-3333",
    code: "ROBERT50",
    referrals: 4,
    converted: 3,
    totalEarned: 150,
    pendingPayout: 0,
    status: "active",
    createdAt: "2024-12-01",
  },
  {
    id: "3",
    name: "Ashley Brown",
    email: "ashley@email.com",
    phone: "(555) 333-4444",
    code: "ASHLEY50",
    referrals: 3,
    converted: 3,
    totalEarned: 100,
    pendingPayout: 50,
    status: "active",
    createdAt: "2024-12-15",
  },
  {
    id: "4",
    name: "Daniel Lee",
    email: "daniel@email.com",
    phone: "(555) 444-5555",
    code: "DANIEL50",
    referrals: 2,
    converted: 1,
    totalEarned: 0,
    pendingPayout: 0,
    status: "inactive",
    createdAt: "2025-01-05",
  },
  {
    id: "5",
    name: "Venue Partner - Grand Ballroom",
    email: "events@grandballroom.com",
    phone: "(555) 555-6666",
    code: "GRAND10",
    referrals: 8,
    converted: 6,
    totalEarned: 300,
    pendingPayout: 0,
    status: "active",
    type: "venue",
    createdAt: "2024-10-01",
  },
];

const recentReferrals = [
  {
    id: "1",
    referrerName: "Jessica Martinez",
    clientName: "Sarah Johnson",
    bookingNumber: "CTM250042",
    bookingTotal: 695,
    discount: 50,
    reward: 50,
    status: "completed",
    date: "2025-02-10",
  },
  {
    id: "2",
    referrerName: "Robert Kim",
    clientName: "Michael Chen",
    bookingNumber: "CTM250041",
    bookingTotal: 375,
    discount: 50,
    reward: 50,
    status: "pending_payout",
    date: "2025-02-08",
  },
  {
    id: "3",
    referrerName: "Ashley Brown",
    clientName: "Emily Rodriguez",
    bookingNumber: "CTM250039",
    bookingTotal: 275,
    discount: 50,
    reward: 50,
    status: "pending_booking",
    date: "2025-02-12",
  },
];

export default function ReferralsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredReferrers = referrers.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Referrals</h1>
          <p className="text-neutral-400 mt-1">
            Manage referral partners and track performance
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Referrer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Active Referrers</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.activeReferrers}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                of {stats.totalReferrers} total
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Converted Referrals</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.convertedReferrals}
              </p>
              <p className="text-xs text-emerald-400 mt-1">
                {stats.conversionRate}% conversion rate
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Paid Out</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.totalPaidOut)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Pending Payouts</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(stats.pendingPayouts)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Referrers table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search referrers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                  Referrer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                  Code
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                  Referrals
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                  Total Earned
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                  Pending
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredReferrers.map((referrer) => (
                <tr
                  key={referrer.id}
                  className="hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {referrer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{referrer.name}</p>
                        <p className="text-sm text-neutral-500">{referrer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-neutral-800 rounded text-sm text-primary-400">
                        {referrer.code}
                      </code>
                      <button
                        onClick={() => copyCode(referrer.code)}
                        className="p-1 text-neutral-500 hover:text-white transition-colors"
                      >
                        {copiedCode === referrer.code ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-white">{referrer.converted}/{referrer.referrals}</p>
                      <p className="text-xs text-neutral-500">converted</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-white font-medium">
                      {formatCurrency(referrer.totalEarned)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {referrer.pendingPayout > 0 ? (
                      <p className="text-amber-400 font-medium">
                        {formatCurrency(referrer.pendingPayout)}
                      </p>
                    ) : (
                      <p className="text-neutral-500">-</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                        referrer.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-neutral-500/20 text-neutral-400"
                      )}
                    >
                      {referrer.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReferrers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-400">No referrers found.</p>
          </div>
        )}
      </div>

      {/* Recent referrals */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="p-4 border-b border-neutral-800">
          <h3 className="font-semibold text-white">Recent Referrals</h3>
        </div>
        <div className="divide-y divide-neutral-800">
          {recentReferrals.map((referral) => (
            <div
              key={referral.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {referral.clientName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Referred by {referral.referrerName} · {referral.bookingNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  {formatCurrency(referral.bookingTotal)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatCurrency(referral.discount)} discount · {formatCurrency(referral.reward)} reward
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium ml-4",
                  referral.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : referral.status === "pending_payout"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-blue-500/20 text-blue-400"
                )}
              >
                {referral.status === "completed"
                  ? "Completed"
                  : referral.status === "pending_payout"
                  ? "Pending Payout"
                  : "Pending Booking"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Referral Program Rules</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-white">Client Discount</p>
              <p className="text-sm text-neutral-400 mt-1">
                New clients get $50 off their first booking when using a referral code
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-white">Referrer Reward</p>
              <p className="text-sm text-neutral-400 mt-1">
                Referrer earns $50 for each successful booking (after event completion)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-white">Venue Partners</p>
              <p className="text-sm text-neutral-400 mt-1">
                Venue partners can offer 10% off to clients and receive $50 per booking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
