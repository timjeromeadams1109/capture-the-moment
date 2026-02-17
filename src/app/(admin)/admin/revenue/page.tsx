"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

// Mock data
const monthlyStats = {
  totalRevenue: 8450,
  target: 8000,
  previousMonth: 7500,
  bookingsCount: 18,
  avgOrderValue: 469,
  depositsCollected: 2112,
  depositsOutstanding: 528,
  fullPayments: 5810,
};

const revenueByMonth = [
  { month: "Sep", revenue: 5200, bookings: 11 },
  { month: "Oct", revenue: 6100, bookings: 13 },
  { month: "Nov", revenue: 7800, bookings: 16 },
  { month: "Dec", revenue: 9200, bookings: 19 },
  { month: "Jan", revenue: 7500, bookings: 15 },
  { month: "Feb", revenue: 8450, bookings: 18 },
];

const revenueByService = [
  { service: "360 Booth", revenue: 5840, bookings: 10, percentage: 69 },
  { service: "Stand-Alone", revenue: 2610, bookings: 8, percentage: 31 },
];

const recentTransactions = [
  {
    id: "1",
    type: "deposit",
    clientName: "Sarah Johnson",
    bookingNumber: "CTM250042",
    amount: 174,
    date: "2025-02-14",
    status: "completed",
  },
  {
    id: "2",
    type: "full_payment",
    clientName: "Michael Chen",
    bookingNumber: "CTM250041",
    amount: 281,
    date: "2025-02-13",
    status: "completed",
  },
  {
    id: "3",
    type: "deposit",
    clientName: "Tech Corp Inc.",
    bookingNumber: "CTM250040",
    amount: 224,
    date: "2025-02-12",
    status: "pending",
  },
  {
    id: "4",
    type: "refund",
    clientName: "Lisa Thompson",
    bookingNumber: "CTM250035",
    amount: -69,
    date: "2025-02-11",
    status: "completed",
  },
  {
    id: "5",
    type: "full_payment",
    clientName: "Corporate Events Co.",
    bookingNumber: "CTM250036",
    amount: 521,
    date: "2025-02-10",
    status: "completed",
  },
];

const topClients = [
  { name: "Corporate Events Co.", totalSpent: 2890, bookings: 4 },
  { name: "Tech Corp Inc.", totalSpent: 1790, bookings: 2 },
  { name: "Sarah Johnson", totalSpent: 695, bookings: 1 },
  { name: "Michael Chen", totalSpent: 375, bookings: 1 },
];

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("month");

  const revenueChange = ((monthlyStats.totalRevenue - monthlyStats.previousMonth) / monthlyStats.previousMonth) * 100;
  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue</h1>
          <p className="text-neutral-400 mt-1">
            Track your business performance and financials
          </p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "quarter", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors capitalize",
                timeRange === range
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {formatCurrency(monthlyStats.totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {revenueChange >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-300" />
                )}
                <span className={revenueChange >= 0 ? "text-emerald-300" : "text-red-300"}>
                  {Math.abs(revenueChange).toFixed(1)}%
                </span>
                <span className="text-primary-200 text-sm">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Deposits Collected</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(monthlyStats.depositsCollected)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Outstanding Deposits</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(monthlyStats.depositsOutstanding)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(monthlyStats.avgOrderValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue chart & breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-6">Revenue Trend</h3>
          <div className="h-64 flex items-end gap-4">
            {revenueByMonth.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="w-full relative">
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500",
                      index === revenueByMonth.length - 1
                        ? "bg-gradient-to-t from-primary-600 to-primary-400"
                        : "bg-neutral-700"
                    )}
                    style={{
                      height: `${(month.revenue / maxRevenue) * 200}px`,
                    }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neutral-400 whitespace-nowrap">
                    {formatCurrency(month.revenue)}
                  </div>
                </div>
                <p className="mt-3 text-sm text-neutral-400">{month.month}</p>
                <p className="text-xs text-neutral-500">{month.bookings} bookings</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by service */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-6">Revenue by Service</h3>
          <div className="space-y-6">
            {revenueByService.map((service) => (
              <div key={service.service}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{service.service}</span>
                  <span className="text-neutral-400">
                    {formatCurrency(service.revenue)}
                  </span>
                </div>
                <div className="relative h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {service.bookings} bookings · {service.percentage}% of total
                </p>
              </div>
            ))}
          </div>

          {/* Target progress */}
          <div className="mt-8 pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Monthly Target</span>
              <span className="text-white font-medium">
                {formatCurrency(monthlyStats.target)}
              </span>
            </div>
            <div className="relative h-3 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                style={{
                  width: `${Math.min((monthlyStats.totalRevenue / monthlyStats.target) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-emerald-400">
              {((monthlyStats.totalRevenue / monthlyStats.target) * 100).toFixed(0)}% of target reached
            </p>
          </div>
        </div>
      </div>

      {/* Recent transactions & top clients */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-semibold text-white">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-neutral-800">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      transaction.type === "refund"
                        ? "bg-red-500/20"
                        : transaction.type === "deposit"
                        ? "bg-amber-500/20"
                        : "bg-emerald-500/20"
                    )}
                  >
                    <DollarSign
                      className={cn(
                        "w-5 h-5",
                        transaction.type === "refund"
                          ? "text-red-400"
                          : transaction.type === "deposit"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {transaction.clientName}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {transaction.bookingNumber} ·{" "}
                      <span className="capitalize">
                        {transaction.type.replace("_", " ")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-semibold",
                      transaction.amount < 0 ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {transaction.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-neutral-500">{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-semibold text-white">Top Clients</h3>
          </div>
          <div className="divide-y divide-neutral-800">
            {topClients.map((client, index) => (
              <div key={client.name} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-300">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{client.name}</p>
                  <p className="text-xs text-neutral-500">
                    {client.bookings} booking{client.bookings !== 1 && "s"}
                  </p>
                </div>
                <p className="font-semibold text-white">
                  {formatCurrency(client.totalSpent)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
