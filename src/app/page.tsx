"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Users, Calendar, Zap, Sparkles, Camera, Play, Heart, PartyPopper, Briefcase, GraduationCap, Cake, Music, Gift, Clock, MapPin, Share2, Download, Smartphone, Image, Video, Award, MessageSquare } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useState, useEffect, useRef } from "react";

// Scroll-triggered fade-in hook
function useScrollFade(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollFade(0.5);
  const numericTarget = parseFloat(target.replace(/[^\d.]/g, ""));
  const isDecimal = target.includes(".");

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000;
    const increment = numericTarget / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? Math.round(start * 10) / 10 : Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, numericTarget, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  );
}

const services = [
  {
    slug: "stand-alone",
    name: "Stand-Alone Photo Booth",
    description:
      "Classic photo booth experience that turns every guest into a content creator. Instant digital delivery means they're sharing before the night ends.",
    price: 275,
    price4hr: 450,
    features: ["Professional Attendant", "Instant Digital Delivery", "Setup & Teardown Included", "60 Miles Included"],
  },
  {
    slug: "360-booth",
    name: "360 Booth Experience",
    description:
      "The show-stopping centerpiece that gets everyone talking. Cinematic slow-motion videos that dominate social feeds for weeks.",
    price: 495,
    price4hr: 575,
    features: ["Professional Attendant", "Cinematic 360° Video", "Setup & Teardown Included", "60 Miles Included"],
    popular: true,
  },
];

const eventTypes = [
  { name: "Weddings", icon: Heart, color: "from-pink-500 to-rose-500", desc: "Capture Every Magical Moment" },
  { name: "Corporate", icon: Briefcase, color: "from-blue-500 to-cyan-500", desc: "Elevate Your Brand Events" },
  { name: "Birthdays", icon: Cake, color: "from-purple-500 to-pink-500", desc: "Make It Unforgettable" },
  { name: "Graduations", icon: GraduationCap, color: "from-amber-500 to-orange-500", desc: "Celebrate Their Achievement" },
  { name: "Quinceañeras", icon: PartyPopper, color: "from-fuchsia-500 to-pink-500", desc: "A Once-In-A-Lifetime Celebration" },
  { name: "Bar Mitzvahs", icon: Star, color: "from-indigo-500 to-purple-500", desc: "Honor The Milestone" },
  { name: "Concerts", icon: Music, color: "from-red-500 to-pink-500", desc: "Amplify The Experience" },
  { name: "Any Event!", icon: Gift, color: "from-primary-500 to-purple-500", desc: "We've Got You Covered" },
];

// Stats for social proof
const stats = [
  { icon: Camera, value: "50K+", label: "Photos Delivered", color: "text-primary-400" },
  { icon: Users, value: "200+", label: "Events Completed", color: "text-purple-400" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "text-yellow-400" },
  { icon: Share2, value: "100K+", label: "Social Shares", color: "text-pink-400" },
];

const steps = [
  {
    number: "1",
    title: "Pick Your Date",
    description: "Check Availability And Request Your Preferred Time.",
    icon: Calendar,
  },
  {
    number: "2",
    title: "We Confirm",
    description: "Your Date Is Held For 24 Hours While We Review. Pay 25% Deposit To Lock In.",
    icon: CheckCircle,
  },
  {
    number: "3",
    title: "We Show Up",
    description: "Setup, Run, Done. Professional Attendant Handles Everything.",
    icon: Zap,
  },
];

const testimonials = [
  {
    quote:
      "The 360 Booth Was The Highlight Of Our Product Launch. Every Guest Left With Content They Actually Posted. Our Hashtag Reached 50K Views.",
    author: "Sarah M.",
    title: "Marketing Director",
    company: "Tech Company",
    eventType: "Corporate Event",
    icon: Briefcase,
  },
  {
    quote:
      "Capture The Moment Has Completely Changed How We Approach Corporate Events. The Content Quality Is Unmatched.",
    author: "Michael R.",
    title: "Event Coordinator",
    company: "Fortune 500",
    eventType: "Product Launch",
    icon: Award,
  },
];

// Animated typing effect for event types
function TypeWriter() {
  const words = ["Weddings", "Birthdays", "Corporate Events", "Graduations", "Quinceañeras", "Bar Mitzvahs", "House Parties", "Any Event"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex, words]);

  return (
    <span className="text-gradient">
      {displayText}
      <span className="animate-blink text-primary-400">|</span>
    </span>
  );
}

// Animated "See It In Action" button with preview thumbnails
function SeeItInActionButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/gallery"
      className="group relative inline-flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated play button */}
      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/30">
        <Play className="w-5 h-5 text-white ml-0.5" />
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-xl bg-white/30 animate-ping-slow opacity-0 group-hover:opacity-100" />
      </div>

      {/* Text content */}
      <div className="text-left">
        <span className="block text-base font-semibold">See It In Action</span>
        <span className="block text-xs text-neutral-400 group-hover:text-neutral-300">Watch 360° Videos & Photos</span>
      </div>

      {/* Floating preview thumbnails on hover */}
      <div className={`absolute -right-2 top-1/2 -translate-y-1/2 flex gap-1 transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg animate-bounce-in">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg animate-bounce-in delay-100">
          <Image className="w-4 h-4 text-white" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-bounce-in delay-200">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </Link>
  );
}

// Floating orb component for background animation
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-slow delay-1000" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl animate-float-slow delay-500" />

      {/* Smaller accent orbs */}
      <div className="absolute top-20 right-1/4 w-32 h-32 bg-primary-400/30 rounded-full blur-2xl animate-pulse-glow" />
      <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-purple-400/25 rounded-full blur-2xl animate-pulse-glow delay-700" />

      {/* Animated particles */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-particle opacity-60" />
      <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-particle delay-1000 opacity-60" />
      <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-primary-300 rounded-full animate-particle delay-500 opacity-60" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}

// Animated event pills floating around
function FloatingEventPills() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
      {/* Floating event type pills */}
      <div className="absolute top-32 right-[15%] animate-pill-1">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-sm border border-pink-500/30 rounded-full">
          <Heart className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-medium text-pink-300">Weddings</span>
        </div>
      </div>
      <div className="absolute top-48 right-[8%] animate-pill-2 delay-300">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
          <Briefcase className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Corporate</span>
        </div>
      </div>
      <div className="absolute top-72 right-[20%] animate-pill-3 delay-500">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full">
          <Cake className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Birthdays</span>
        </div>
      </div>
      <div className="absolute bottom-48 right-[12%] animate-pill-4 delay-700">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">Graduations</span>
        </div>
      </div>
      <div className="absolute bottom-64 right-[25%] animate-pill-1 delay-200">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 backdrop-blur-sm border border-fuchsia-500/30 rounded-full">
          <PartyPopper className="w-4 h-4 text-fuchsia-400" />
          <span className="text-sm font-medium text-fuchsia-300">Quinceañeras</span>
        </div>
      </div>
    </div>
  );
}

// Animated camera graphic
function AnimatedCameraGraphic() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute w-72 h-72 rounded-full border-2 border-primary-500/30 animate-spin-slow" />
      <div className="absolute w-80 h-80 rounded-full border border-purple-500/20 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />

      {/* Pulsing rings */}
      <div className="absolute w-48 h-48 rounded-full bg-primary-500/10 animate-ping-slow" />
      <div className="absolute w-40 h-40 rounded-full bg-purple-500/10 animate-ping-slow delay-500" />

      {/* Center camera icon */}
      <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center animate-scale-pulse shadow-2xl shadow-primary-500/30">
        <Camera className="w-16 h-16 text-white animate-icon-bounce" />

        {/* Flash effect */}
        <div className="absolute inset-0 bg-white rounded-2xl animate-flash opacity-0" />
      </div>

      {/* Orbiting elements */}
      <div className="absolute animate-orbit">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
          <Heart className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="absolute animate-orbit delay-300" style={{ animationDuration: '15s' }}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="absolute animate-orbit delay-700" style={{ animationDuration: '25s' }}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Cake className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Scroll fade refs for all sections
  const servicesSection = useScrollFade(0.1);
  const eventsSection = useScrollFade(0.1);
  const howItWorksSection = useScrollFade(0.1);
  const testimonialsSection = useScrollFade(0.1);
  const pricingSection = useScrollFade(0.1);
  const referralSection = useScrollFade(0.2);
  const ctaSection = useScrollFade(0.2);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center bg-neutral-950 text-white overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/50 via-transparent to-purple-950/50 animate-gradient" />

        {/* Floating orbs */}
        <FloatingOrbs />

        {/* Floating event pills */}
        <FloatingEventPills />

        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary-500 to-transparent animate-pulse-glow" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse-glow delay-300" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-8 animate-fade-in animate-glow-pulse">
                <Sparkles className="w-4 h-4 text-primary-400 animate-icon-bounce" />
                <span className="text-sm font-medium text-neutral-200">Available for ANY Event</span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
                <span className="block text-white">Photo booths for</span>
                <span className="block mt-2 min-h-[1.2em]">
                  <TypeWriter />
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-neutral-300 mb-8 animate-slide-up delay-200">
                We Bring The Party To <span className="text-white font-semibold">Any Celebration</span>.
                From Intimate Birthdays To Massive Corporate Events—If There&apos;s A Guest List, We&apos;re There.
              </p>

              {/* Event type pills - mobile */}
              <div className="flex flex-wrap gap-2 mb-8 lg:hidden animate-slide-up delay-300">
                {eventTypes.slice(0, 6).map((event, i) => (
                  <div
                    key={event.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${event.color} bg-opacity-20 border border-white/10 text-xs font-medium text-white/90`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <event.icon className="w-3 h-3" />
                    {event.name}
                  </div>
                ))}
              </div>

              {/* Value props with icons */}
              <div className="space-y-4 mb-10 animate-slide-up delay-300">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Instant Digital Delivery</p>
                    <p className="text-sm text-neutral-400">Guests Share Before The Night Ends</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Cinematic 360° Videos</p>
                    <p className="text-sm text-neutral-400">Slow-Motion Content That Goes Viral</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Full-Service Experience</p>
                    <p className="text-sm text-neutral-400">Setup, Attendant & Teardown Included</p>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-400">
                <Button size="xl" asChild className="group animate-glow-pulse">
                  <Link href="/book">
                    Check Availability
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <SeeItInActionButton />
              </div>
            </div>

            {/* Animated graphic - desktop only */}
            <div className="hidden lg:block h-[500px] animate-fade-in delay-500">
              <AnimatedCameraGraphic />
            </div>
          </div>
        </div>

        {/* Trust indicators bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/50 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3 animate-fade-in group cursor-default" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      <AnimatedCounter target={stat.value.replace('+', '')} suffix={stat.value.includes('+') ? '+' : ''} />
                    </p>
                    <p className="text-xs text-neutral-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Marquee */}
      <section className="py-8 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 overflow-hidden">
        <div className="flex animate-slide-loop">
          <div className="flex gap-8 items-center whitespace-nowrap px-4">
            {[...eventTypes, ...eventTypes, ...eventTypes].map((event, i) => (
              <div key={i} className="flex items-center gap-2 text-white/90">
                <event.icon className="w-5 h-5" />
                <span className="font-medium">{event.name}</span>
                <span className="text-white/50 mx-4">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        ref={servicesSection.ref}
        className="py-24 bg-white relative overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            servicesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
              EXPERIENCES
            </span>
            <h2 className="heading-2 text-neutral-900 mb-4">
              Two Experiences That Multiply Your Event&apos;s Reach
            </h2>
            <p className="body-large text-neutral-600 max-w-2xl mx-auto">
              Perfect For <span className="font-semibold text-neutral-900">Any Celebration</span>—From Backyard Birthdays To Ballroom Galas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <Card
                key={service.slug}
                variant="interactive"
                padding="none"
                className={`relative overflow-hidden group hover-tilt transition-all duration-700 ${
                  servicesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: servicesSection.isVisible ? `${index * 200}ms` : '0ms' }}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 flex items-center gap-1 animate-scale-pulse">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                )}
                <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20 group-hover:from-primary-600/40 group-hover:to-purple-600/40 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  {/* Animated shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">{service.description}</p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={feature} className="flex items-center gap-3 text-neutral-600" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-3 h-3 text-primary-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-sm text-neutral-500">Starting at</span>
                      <p className="text-3xl font-bold text-neutral-900">${service.price}</p>
                    </div>
                    <Button asChild className="group/btn">
                      <Link href={`/book?service=${service.slug}`}>
                        Book Now
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Events Welcome Section */}
      <section
        ref={eventsSection.ref}
        className="py-24 bg-neutral-950 text-white relative overflow-hidden"
      >
        <FloatingOrbs />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            eventsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-primary-300 text-sm font-semibold mb-4">
              ANY OCCASION
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Every Event Deserves To Be
              <span className="block text-gradient mt-2">Unforgettable</span>
            </h2>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              We&apos;ve Captured Memories At Every Type Of Celebration Imaginable. If It&apos;s Worth Celebrating, We&apos;re There.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {eventTypes.map((event, i) => (
              <Link
                href="/book"
                key={event.name}
                className={`group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-500 hover-tilt ${
                  eventsSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ transitionDelay: eventsSection.isVisible ? `${i * 100}ms` : '0ms' }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}>
                  <event.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{event.name}</h3>
                <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">{event.desc}</p>

                {/* Book now indicator */}
                <div className="mt-3 flex items-center gap-1 text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Book Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-10 transition-opacity -z-10 blur-xl`} />
              </Link>
            ))}
          </div>

          <div className={`text-center mt-12 transition-all duration-700 delay-500 ${
            eventsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-neutral-400 mb-6">Don&apos;t See Your Event Type? <span className="text-white font-semibold">We Do That Too.</span></p>
            <Button size="lg" asChild className="animate-glow-pulse">
              <Link href="/book" className="group">
                Book Your Event Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        ref={howItWorksSection.ref}
        className="py-24 bg-neutral-50 relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="heading-2 text-neutral-900 mb-4">
              Booked In Minutes. Memories For A Lifetime.
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Three Simple Steps To An Unforgettable Event Experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative group transition-all duration-700 ${
                  howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: howItWorksSection.isVisible ? `${index * 200}ms` : '0ms' }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-transparent" />
                )}

                <div className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 text-center">
                  {/* Step number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.number}
                  </div>

                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6 shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform mt-4">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">{step.description}</p>

                  {/* Additional info */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    {index === 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-primary-600">
                        <Clock className="w-4 h-4" />
                        <span>Takes Less Than 2 Minutes</span>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-primary-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>24-Hour Hold Guaranteed</span>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-primary-600">
                        <MapPin className="w-4 h-4" />
                        <span>60 Miles Included Free</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`text-center mt-14 transition-all duration-700 delay-500 ${
            howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Button size="lg" asChild className="animate-glow-pulse">
              <Link href="/book" className="group">
                Check Availability Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-neutral-500">No Credit Card Required To Check Dates</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsSection.ref}
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
              TESTIMONIALS
            </span>
            <h2 className="heading-2 text-neutral-900 mb-4">
              Trusted By Event Planners Who Get It
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`bg-neutral-50 border border-neutral-200 rounded-2xl p-8 hover:shadow-lg hover:border-primary-200 transition-all duration-500 hover-tilt ${
                  testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: testimonialsSection.isVisible ? `${i * 200}ms` : '0ms' }}
              >
                {/* Event type badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full">
                    <testimonial.icon className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-medium text-primary-600">{testimonial.eventType}</span>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-lg text-neutral-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold">{testimonial.author.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section
        ref={pricingSection.ref}
        className="py-24 bg-neutral-50 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${
            pricingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
              SIMPLE PRICING
            </span>
            <h2 className="heading-2 text-neutral-900 mb-4">
              Transparent Pricing. No Surprises.
            </h2>
            <p className="body-large text-neutral-600 max-w-xl mx-auto">
              Everything Included: Attendant, Setup, Teardown, And Instant Digital Delivery.
            </p>
          </div>

          {/* Main pricing cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {services.map((service, i) => (
              <div
                key={service.slug}
                className={`group rounded-3xl border-2 p-8 transition-all duration-700 bg-white hover-tilt relative overflow-hidden ${
                  service.popular
                    ? 'border-primary-400 shadow-xl shadow-primary-500/20'
                    : 'border-neutral-200 hover:border-primary-300 hover:shadow-xl'
                } ${
                  pricingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: pricingSection.isVisible ? `${i * 200}ms` : '0ms' }}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  service.popular
                    ? 'bg-gradient-to-br from-primary-50 to-purple-50'
                    : 'bg-gradient-to-br from-neutral-50 to-primary-50'
                }`} />

                {service.popular && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500" />
                )}

                <div className="relative">
                  {service.popular && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full text-white text-xs font-semibold mb-4">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      service.popular
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-primary-500/30'
                        : 'bg-gradient-to-br from-neutral-700 to-neutral-900 shadow-neutral-500/20'
                    }`}>
                      {i === 0 ? <Camera className="w-8 h-8 text-white" /> : <Video className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900">
                        {service.name}
                      </h3>
                      <p className="text-neutral-500 text-sm">Perfect For Any Event</p>
                    </div>
                  </div>

                  {/* Pricing tiers */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* 2 Hour Option */}
                    <div className="p-4 rounded-2xl bg-neutral-100 border-2 border-transparent hover:border-neutral-300 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">2 Hours</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-neutral-900">${service.price}</span>
                      </div>
                    </div>

                    {/* 4 Hour Option - Best Value */}
                    <div className={`p-4 rounded-2xl border-2 transition-colors cursor-pointer relative overflow-hidden ${
                      service.popular
                        ? 'bg-gradient-to-br from-primary-50 to-purple-50 border-primary-300 hover:border-primary-400'
                        : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:border-emerald-400'
                    }`}>
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-bl-lg">
                        BEST VALUE
                      </div>
                      <div className={`flex items-center gap-2 mb-2 ${service.popular ? 'text-primary-600' : 'text-emerald-600'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">4 Hours</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${service.popular ? 'text-primary-600' : 'text-emerald-600'}`}>${service.price4hr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-neutral-700">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          service.popular ? 'bg-primary-100' : 'bg-neutral-100'
                        }`}>
                          <CheckCircle className={`w-3.5 h-3.5 ${service.popular ? 'text-primary-600' : 'text-neutral-600'}`} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button fullWidth size="lg" variant={service.popular ? "primary" : "outline"} asChild className="group/btn">
                    <Link href={`/book?service=${service.slug}`}>
                      Book This Package
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Package Banner */}
          <div className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${
            pricingSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <div className="relative rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-8 md:p-10 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-center gap-8">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-scale-pulse">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Need A Custom Package?
                  </h3>
                  <p className="text-neutral-300 mb-4">
                    Different Duration • Multiple Booths • Special Setup • Corporate Branding
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-neutral-300">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Custom Time Slots
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-neutral-300">
                      <Gift className="w-4 h-4 text-amber-400" />
                      Special Events
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-neutral-300">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      Corporate Rates
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <Button size="lg" className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-neutral-900 font-semibold shadow-lg shadow-amber-500/30" asChild>
                    <a href="tel:+19495550123" className="flex items-center justify-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Call Us
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                    <Link href="/book?custom=true" className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Message For Pricing
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-neutral-500 mt-10">
            Add-Ons Available: Premium Branding, LED Lighting, Extra Hours, And More.
          </p>
        </div>
      </section>

      {/* Referral Banner */}
      <section
        ref={referralSection.ref}
        className="py-16 bg-gradient-to-r from-primary-600 to-purple-600 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-float-slow delay-700" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center text-white transition-all duration-700 ${
            referralSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Gift className="w-5 h-5" />
              <span className="font-medium">Referral Program</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Know Someone Planning An Event?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Refer A Friend And Earn $50 When They Book. They Get $25 Off Their First Booking Too.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-neutral-100 group"
              asChild
            >
              <Link href="/referrals">
                Learn About Referrals
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={ctaSection.ref}
        className="py-24 bg-neutral-950 text-white relative overflow-hidden"
      >
        <FloatingOrbs />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8 transition-all duration-700 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Calendar className="w-5 h-5 text-primary-400" />
            <span className="text-neutral-200">Limited Dates Available</span>
          </div>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-6 transition-all duration-700 delay-100 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            Ready To Make Your Event
            <span className="block animate-text-shimmer mt-2">Unforgettable?</span>
          </h2>
          <p className={`text-xl text-neutral-300 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            We&apos;re Ready For <span className="text-white font-semibold">Any Event</span>. Check Availability For Your Date.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Button size="xl" asChild className="group animate-glow-pulse">
              <Link href="/book">
                Check Availability Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-400 transition-all duration-700 delay-500 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <a href="tel:+19495550123" className="flex items-center gap-2 hover:text-white transition-colors">
              <Smartphone className="w-5 h-5" />
              <span>(949) 555-0123</span>
            </a>
            <span className="hidden sm:block">•</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Serving All Of Southern California</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
