"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

// Mock events data
const mockEvents = [
  {
    id: "1",
    bookingNumber: "CTM250042",
    clientName: "Sarah Johnson",
    service: "360 Booth",
    date: "2025-02-22",
    startTime: "18:00",
    endTime: "21:00",
    venue: "The Grand Ballroom, Irvine",
    status: "deposit_paid",
  },
  {
    id: "2",
    bookingNumber: "CTM250041",
    clientName: "Michael Chen",
    service: "Stand-Alone",
    date: "2025-02-20",
    startTime: "19:00",
    endTime: "21:00",
    venue: "Private Residence, Newport Beach",
    status: "confirmed",
  },
  {
    id: "3",
    bookingNumber: "CTM250040",
    clientName: "Tech Corp Inc.",
    service: "360 Booth",
    date: "2025-02-18",
    startTime: "17:00",
    endTime: "21:00",
    venue: "Innovation Center, Costa Mesa",
    status: "approved",
  },
  {
    id: "7",
    bookingNumber: "CTM250036",
    clientName: "Corporate Events Co.",
    service: "360 Booth",
    date: "2025-02-15",
    startTime: "18:00",
    endTime: "21:00",
    venue: "Convention Center, Anaheim",
    status: "completed",
  },
  {
    id: "5",
    bookingNumber: "CTM250038",
    clientName: "David Park",
    service: "360 Booth",
    date: "2025-02-28",
    startTime: "16:00",
    endTime: "19:00",
    venue: "Art Gallery, Santa Ana",
    status: "held",
  },
  {
    id: "6",
    bookingNumber: "CTM250037",
    clientName: "Amanda White",
    service: "360 Booth",
    date: "2025-03-15",
    startTime: "17:00",
    endTime: "21:00",
    venue: "Seaside Resort, Huntington Beach",
    status: "requested",
  },
];

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  requested: { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-400" },
  held: { bg: "bg-yellow-500/20", border: "border-yellow-500", text: "text-yellow-400" },
  approved: { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-400" },
  deposit_paid: { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400" },
  confirmed: { bg: "bg-green-500/20", border: "border-green-500", text: "text-green-400" },
  completed: { bg: "bg-neutral-500/20", border: "border-neutral-500", text: "text-neutral-400" },
  cancelled: { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-400" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  const eventsMap = useMemo(() => {
    const map: Record<string, typeof mockEvents> = {};
    mockEvents.forEach((event) => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, []);

  const selectedDateEvents = selectedDate ? eventsMap[selectedDate] || [] : [];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    return formatDateKey(date) === formatDateKey(today);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-neutral-400 mt-1">
            View and manage your upcoming events
          </p>
        </div>
        <Button onClick={goToToday} variant="outline">
          Today
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPrevMonth}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("month")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  view === "month"
                    ? "bg-primary-600 text-white"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  view === "week"
                    ? "bg-primary-600 text-white"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                Week
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-neutral-800 rounded-lg overflow-hidden">
            {/* Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-neutral-900 py-3 text-center text-sm font-medium text-neutral-400"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dateKey = formatDateKey(date);
              const dayEvents = eventsMap[dateKey] || [];
              const isSelected = selectedDate === dateKey;
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateKey)}
                  className={cn(
                    "bg-neutral-900 min-h-24 p-2 text-left transition-colors hover:bg-neutral-800",
                    !isCurrentMonth && "opacity-40",
                    isSelected && "ring-2 ring-primary-500 ring-inset"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm",
                      isTodayDate
                        ? "bg-primary-600 text-white font-semibold"
                        : "text-neutral-300"
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const colors = statusColors[event.status] || statusColors.requested;
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-xs truncate border-l-2",
                            colors.bg,
                            colors.border
                          )}
                        >
                          <span className={colors.text}>{event.clientName}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-neutral-500 pl-1">
                        +{dayEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date details */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-semibold text-white">
              {selectedDate
                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </h3>
          </div>

          {selectedDate ? (
            selectedDateEvents.length > 0 ? (
              <div className="divide-y divide-neutral-800">
                {selectedDateEvents.map((event) => {
                  const colors = statusColors[event.status] || statusColors.requested;
                  return (
                    <Link
                      key={event.id}
                      href={`/admin/bookings/${event.id}`}
                      className="block p-4 hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {event.service}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {event.bookingNumber}
                        </span>
                      </div>
                      <h4 className="font-medium text-white mb-2">
                        {event.clientName}
                      </h4>
                      <div className="space-y-1 text-sm text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-neutral-500" />
                </div>
                <p className="text-neutral-400 mb-3">No events on this day</p>
                <Button variant="outline" size="sm">
                  Block Date
                </Button>
              </div>
            )
          ) : (
            <div className="p-8 text-center text-neutral-500">
              Click on a date to view events
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", colors.bg, "border", colors.border)} />
            <span className="text-neutral-400 capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
