"use client";

// Prevent static generation - this page requires runtime features
export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  User,
  Building,
  CreditCard,
  Bell,
  MessageSquare,
  Calendar,
  Lock,
  Globe,
  Save,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "business", label: "Business Info", icon: Building },
  { id: "services", label: "Services & Pricing", icon: Calendar },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "sms", label: "SMS Settings", icon: MessageSquare },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Lock },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("business");
  const [hasChanges, setHasChanges] = useState(false);

  // Business info state
  const [businessInfo, setBusinessInfo] = useState({
    name: "Capture The Moment Photo Booths",
    email: "info@capturedthemoment.com",
    phone: "(714) 555-0123",
    website: "www.capturedthemoment.com",
    address: "123 Main St, Irvine, CA 92618",
    serviceArea: "Orange County, CA & surrounding areas",
    description: "Premium photo booth experiences for weddings, corporate events, and private parties.",
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailDepositPaid: true,
    emailHoldExpiring: true,
    smsNewBooking: true,
    smsDepositPaid: false,
    smsHoldExpiring: true,
    dailyDigest: true,
    weeklyReport: true,
  });

  // SMS settings state
  const [smsSettings, setSmsSettings] = useState({
    twilioSid: "AC...",
    twilioToken: "••••••••••••••••",
    fromNumber: "+17145550123",
    autoConfirmation: true,
    autoReminder24h: true,
    autoReminder4h: false,
    autoReviewRequest: true,
  });

  const handleSave = () => {
    alert("Settings would be saved to database");
    setHasChanges(false);
  };

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Business Name</label>
            <input
              type="text"
              value={businessInfo.name}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, name: e.target.value });
                setHasChanges(true);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Email</label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, email: e.target.value });
                setHasChanges(true);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Phone</label>
            <input
              type="tel"
              value={businessInfo.phone}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, phone: e.target.value });
                setHasChanges(true);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Website</label>
            <input
              type="text"
              value={businessInfo.website}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, website: e.target.value });
                setHasChanges(true);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-400 mb-2">Address</label>
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, address: e.target.value });
                setHasChanges(true);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-400 mb-2">Service Area</label>
            <input
              type="text"
              value={businessInfo.serviceArea}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, serviceArea: e.target.value });
                setHasChanges(true);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-400 mb-2">Description</label>
            <textarea
              value={businessInfo.description}
              onChange={(e) => {
                setBusinessInfo({ ...businessInfo, description: e.target.value });
                setHasChanges(true);
              }}
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Services & Pricing</h3>
        <p className="text-neutral-400 mb-6">
          Configure your service offerings and pricing tiers.
        </p>

        {/* Stand-Alone Service */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Stand-Alone Photo Booth</h4>
            <span className="text-emerald-400 text-sm">Active</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Base Price (2hr)</p>
              <p className="text-white font-medium">$275</p>
            </div>
            <div>
              <p className="text-neutral-500">Extra Hour</p>
              <p className="text-white font-medium">$100</p>
            </div>
            <div>
              <p className="text-neutral-500">Holiday Markup</p>
              <p className="text-white font-medium">25%</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Edit Pricing
          </Button>
        </div>

        {/* 360 Booth Service */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">360 Booth Experience</h4>
            <span className="text-emerald-400 text-sm">Active</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Base Price (2hr)</p>
              <p className="text-white font-medium">$495</p>
            </div>
            <div>
              <p className="text-neutral-500">Extra Hour</p>
              <p className="text-white font-medium">$200</p>
            </div>
            <div>
              <p className="text-neutral-500">Holiday Markup</p>
              <p className="text-white font-medium">25%</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Edit Pricing
          </Button>
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <h4 className="font-semibold text-white mb-4">Add-ons</h4>
        <div className="space-y-2">
          {[
            { name: "Custom Props Package", price: 75 },
            { name: "Extra Prints (100)", price: 50 },
            { name: "Custom Backdrop", price: 150 },
            { name: "Guest Book Album", price: 95 },
            { name: "LED Lighting Setup", price: 125 },
          ].map((addon) => (
            <div
              key={addon.name}
              className="flex items-center justify-between p-3 bg-neutral-800 border border-neutral-700 rounded-lg"
            >
              <span className="text-white">{addon.name}</span>
              <span className="text-neutral-400">${addon.price}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4">
          Manage Add-ons
        </Button>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Payment Settings</h3>

        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Stripe</p>
                <p className="text-sm text-neutral-500">Connected</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
              Active
            </span>
          </div>
          <div className="text-sm text-neutral-400">
            <p>Account: Capture The Moment LLC</p>
            <p>Mode: Live</p>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Manage Stripe
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Deposit Percentage</label>
            <select className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="100">100% (Full payment)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Hold Duration</label>
            <select className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-white mb-3">Email Notifications</h4>
            <div className="space-y-3">
              {[
                { key: "emailNewBooking", label: "New booking requests" },
                { key: "emailDepositPaid", label: "Deposit payments received" },
                { key: "emailHoldExpiring", label: "Holds expiring soon" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer">
                  <span className="text-neutral-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => {
                      setNotifications({ ...notifications, [item.key]: e.target.checked });
                      setHasChanges(true);
                    }}
                    className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">SMS Notifications</h4>
            <div className="space-y-3">
              {[
                { key: "smsNewBooking", label: "New booking requests" },
                { key: "smsDepositPaid", label: "Deposit payments received" },
                { key: "smsHoldExpiring", label: "Holds expiring soon" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer">
                  <span className="text-neutral-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => {
                      setNotifications({ ...notifications, [item.key]: e.target.checked });
                      setHasChanges(true);
                    }}
                    className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Reports</h4>
            <div className="space-y-3">
              {[
                { key: "dailyDigest", label: "Daily summary digest" },
                { key: "weeklyReport", label: "Weekly performance report" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer">
                  <span className="text-neutral-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => {
                      setNotifications({ ...notifications, [item.key]: e.target.checked });
                      setHasChanges(true);
                    }}
                    className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSMS = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">SMS Configuration</h3>

        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-white">Twilio</p>
                <p className="text-sm text-neutral-500">SMS Provider</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
              Connected
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Account SID</label>
              <input
                type="text"
                value={smsSettings.twilioSid}
                readOnly
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">From Number</label>
              <input
                type="text"
                value={smsSettings.fromNumber}
                readOnly
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-400 text-sm"
              />
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update Credentials
          </Button>
        </div>

        <div>
          <h4 className="font-medium text-white mb-3">Automated Messages</h4>
          <div className="space-y-3">
            {[
              { key: "autoConfirmation", label: "Booking confirmation", description: "Send when booking is confirmed" },
              { key: "autoReminder24h", label: "24-hour reminder", description: "Send 24 hours before event" },
              { key: "autoReminder4h", label: "4-hour reminder", description: "Send 4 hours before event" },
              { key: "autoReviewRequest", label: "Review request", description: "Send 24 hours after event" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer">
                <div>
                  <p className="text-white">{item.label}</p>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsSettings[item.key as keyof typeof smsSettings] as boolean}
                  onChange={(e) => {
                    setSmsSettings({ ...smsSettings, [item.key]: e.target.checked });
                    setHasChanges(true);
                  }}
                  className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-primary-500 focus:ring-primary-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">AD</span>
          </div>
          <div>
            <p className="font-medium text-white">Admin User</p>
            <p className="text-sm text-neutral-500">admin@capturedthemoment.com</p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Avatar
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">First Name</label>
              <input
                type="text"
                defaultValue="Admin"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Last Name</label>
              <input
                type="text"
                defaultValue="User"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Email</label>
            <input
              type="email"
              defaultValue="admin@capturedthemoment.com"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="(714) 555-0123"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-white mb-3">Change Password</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button variant="outline">Update Password</Button>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800">
            <h4 className="font-medium text-white mb-3">Two-Factor Authentication</h4>
            <p className="text-sm text-neutral-400 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <Button variant="outline">Enable 2FA</Button>
          </div>

          <div className="pt-6 border-t border-neutral-800">
            <h4 className="font-medium text-white mb-3">Active Sessions</h4>
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Current Session</p>
                    <p className="text-sm text-neutral-500">Chrome on macOS · Irvine, CA</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "business":
        return renderBusinessInfo();
      case "services":
        return renderServices();
      case "payments":
        return renderPayments();
      case "notifications":
        return renderNotifications();
      case "sms":
        return renderSMS();
      case "account":
        return renderAccount();
      case "security":
        return renderSecurity();
      default:
        return renderBusinessInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400 mt-1">
            Manage your business and account settings
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  activeSection === section.id
                    ? "bg-primary-600 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
