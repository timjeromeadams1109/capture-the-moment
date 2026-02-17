"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Camera,
  Video,
  Heart,
  Briefcase,
  PartyPopper,
  Grid3X3,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

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
  const numericTarget = parseInt(target.replace(/\D/g, ""));

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
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, numericTarget]);

  return (
    <div ref={ref}>
      <p className="text-5xl sm:text-6xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </p>
    </div>
  );
}

// Gallery items - Photo booth and event images
// Free stock images from Unsplash showing photo booth experiences
const galleryItems: {
  id: number;
  src: string;
  alt: string;
  category: string;
  type: "photo" | "video";
  event: string;
  date: string;
}[] = [
  // Photo Booth Images
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
    alt: "Photo Booth Props And Accessories",
    category: "photobooth",
    type: "photo",
    event: "Props Collection",
    date: "Available For Your Event",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    alt: "Couple Posing With Props At Wedding",
    category: "wedding",
    type: "photo",
    event: "Miller Wedding",
    date: "January 2025",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    alt: "Friends Having Fun With Photo Props",
    category: "birthday",
    type: "photo",
    event: "25th Birthday Bash",
    date: "December 2024",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    alt: "Event With Colorful Lighting",
    category: "360booth",
    type: "video",
    event: "360 Experience",
    date: "February 2025",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    alt: "Party Crowd With Confetti",
    category: "birthday",
    type: "photo",
    event: "New Years Celebration",
    date: "January 2025",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    alt: "Corporate Event Setup",
    category: "corporate",
    type: "photo",
    event: "Tech Summit 2025",
    date: "January 2025",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    alt: "Elegant Wedding Reception",
    category: "wedding",
    type: "photo",
    event: "Anderson Wedding",
    date: "November 2024",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
    alt: "Fun Party With Sparklers",
    category: "360booth",
    type: "video",
    event: "360 Slow Motion",
    date: "December 2024",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1529543544277-750e2e766cfc?w=800&q=80",
    alt: "Professional Event Photography",
    category: "corporate",
    type: "photo",
    event: "Annual Gala",
    date: "October 2024",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    alt: "Colorful Balloons And Party Setup",
    category: "birthday",
    type: "photo",
    event: "Sweet 16 Party",
    date: "September 2024",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    alt: "Wedding Guests Dancing",
    category: "wedding",
    type: "photo",
    event: "Chen Wedding",
    date: "August 2024",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
    alt: "Concert And Event Lighting",
    category: "360booth",
    type: "video",
    event: "360 Light Show",
    date: "July 2024",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=800&q=80",
    alt: "Team Building Event",
    category: "corporate",
    type: "photo",
    event: "Company Retreat",
    date: "June 2024",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80",
    alt: "Party Photo Props And Masks",
    category: "photobooth",
    type: "photo",
    event: "Masquerade Night",
    date: "May 2024",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    alt: "Friends Celebrating Together",
    category: "birthday",
    type: "photo",
    event: "Graduation Party",
    date: "April 2024",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    alt: "Bride And Groom Portraits",
    category: "wedding",
    type: "photo",
    event: "Martinez Wedding",
    date: "March 2024",
  },
];

const categories = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "photobooth", label: "Photo Booth", icon: Camera },
  { id: "360booth", label: "360 Booth", icon: Video },
  { id: "wedding", label: "Weddings", icon: Heart },
  { id: "corporate", label: "Corporate", icon: Briefcase },
  { id: "birthday", label: "Birthdays", icon: PartyPopper },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "photo" | "video">("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Scroll fade refs for sections
  const statsSection = useScrollFade(0.3);
  const gallerySection = useScrollFade(0.1);
  const ctaSection = useScrollFade(0.3);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  const filteredItems = galleryItems.filter((item) => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const typeMatch = selectedType === "all" || item.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-32 sm:py-40 bg-neutral-950 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80')] bg-cover bg-center opacity-20 animate-[scale-pulse_20s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-primary-400 rounded-full animate-[particle-float_8s_ease-in-out_infinite]" />
          <div className="absolute top-40 right-[15%] w-3 h-3 bg-purple-400 rounded-full animate-[particle-float_10s_ease-in-out_infinite_1s]" />
          <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-pink-400 rounded-full animate-[particle-float_7s_ease-in-out_infinite_2s]" />
          <div className="absolute top-60 right-[25%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-[particle-float_9s_ease-in-out_infinite_0.5s]" />
          <div className="absolute bottom-40 right-[10%] w-2 h-2 bg-emerald-400 rounded-full animate-[particle-float_11s_ease-in-out_infinite_1.5s]" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-[glow-pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-[glow-pulse_8s_ease-in-out_infinite_2s]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge with animation */}
          <div className={cn(
            "transition-all duration-1000 ease-out",
            heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-primary-300 text-sm font-semibold mb-8 animate-[bounce-in_0.6s_ease-out]">
              <Sparkles className="w-4 h-4 animate-[spin-slow_4s_linear_infinite]" />
              OUR WORK
              <Sparkles className="w-4 h-4 animate-[spin-slow_4s_linear_infinite_reverse]" />
            </span>
          </div>

          {/* BIGGER Title with gradient and animation */}
          <h1 className={cn(
            "text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 transition-all duration-1000 delay-200 ease-out",
            heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}>
            <span className="block bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto]">
              See The Magic
            </span>
            <span className="block mt-2 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_auto] [animation-delay:0.5s]">
              In Action
            </span>
          </h1>

          <p className={cn(
            "text-xl sm:text-2xl text-neutral-300 max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-500 ease-out",
            heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            Browse Through Hundreds Of Unforgettable Moments We&apos;ve Captured At Weddings, Corporate Events, Birthdays, And More.
          </p>

          {/* Scroll indicator */}
          <div className={cn(
            "mt-8 transition-all duration-1000 delay-700",
            heroLoaded ? "opacity-100" : "opacity-0"
          )}>
            <div className="w-6 h-10 mx-auto border-2 border-white/30 rounded-full flex justify-center p-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-[bounce_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with scroll-triggered fade */}
      <section
        ref={statsSection.ref}
        className={cn(
          "py-16 bg-neutral-900 border-y border-neutral-800 transition-all duration-1000 ease-out",
          statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            <div className={cn(
              "text-center transition-all duration-700 delay-100",
              statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}>
              <AnimatedCounter target="50000" suffix="+" />
              <p className="text-neutral-400 mt-2 text-lg">Photos Taken</p>
            </div>
            <div className={cn(
              "text-center transition-all duration-700 delay-300",
              statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}>
              <AnimatedCounter target="200" suffix="+" />
              <p className="text-neutral-400 mt-2 text-lg">Events Covered</p>
            </div>
            <div className={cn(
              "text-center transition-all duration-700 delay-500",
              statsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}>
              <AnimatedCounter target="100000" suffix="+" />
              <p className="text-neutral-400 mt-2 text-lg">Social Shares</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters with glass effect */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30 animate-[bounce-in_0.3s_ease-out]"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:shadow-md"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <category.icon className={cn(
                    "w-4 h-4 transition-transform",
                    selectedCategory === category.id && "animate-[icon-bounce_0.5s_ease-out]"
                  )} />
                  {category.label}
                </button>
              ))}
            </div>

            {/* Type filters */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
              <button
                onClick={() => setSelectedType("all")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  selectedType === "all"
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType("photo")}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  selectedType === "photo"
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                <Camera className={cn(
                  "w-4 h-4",
                  selectedType === "photo" && "animate-[bounce-in_0.3s_ease-out]"
                )} />
                Photos
              </button>
              <button
                onClick={() => setSelectedType("video")}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                  selectedType === "video"
                    ? "bg-neutral-900 text-white shadow-md"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                <Video className={cn(
                  "w-4 h-4",
                  selectedType === "video" && "animate-[bounce-in_0.3s_ease-out]"
                )} />
                360° Videos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid with scroll-triggered fade */}
      <section
        ref={gallerySection.ref}
        className="py-16 bg-neutral-50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className={cn(
            "text-center mb-12 transition-all duration-700",
            gallerySection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Explore Our <span className="text-primary-600">Gallery</span>
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Click Any Image To View Full Size
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className={cn(
                  "group relative aspect-square rounded-2xl overflow-hidden bg-neutral-200 cursor-pointer transition-all duration-700 hover:shadow-2xl hover:shadow-primary-500/20",
                  gallerySection.isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
                )}
                style={{
                  transitionDelay: gallerySection.isVisible ? `${(index % 8) * 100}ms` : "0ms"
                }}
              >
                {/* Image with zoom effect */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Video indicator with pulse */}
                {item.type === "video" && (
                  <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
                    <Play className="w-5 h-5 text-neutral-900 ml-0.5 relative z-10" />
                  </div>
                )}

                {/* Info on hover with slide up */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <p className="text-white font-bold text-lg">{item.event}</p>
                  <p className="text-neutral-300 text-sm">{item.date}</p>
                </div>

                {/* Category badge with bounce */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-[bounce-in_0.4s_ease-out]">
                  <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-neutral-900 capitalize shadow-lg">
                    {item.category === "360booth" ? "360 Booth" : item.category === "photobooth" ? "Photo Booth" : item.category}
                  </span>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary-500/30 to-transparent" />
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 animate-[bounce-in_0.5s_ease-out]">
              <Camera className="w-20 h-20 text-neutral-300 mx-auto mb-4 animate-[icon-bounce_2s_ease-in-out_infinite]" />
              <p className="text-neutral-500 text-xl">No Items Found For This Filter</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with scroll-triggered fade */}
      <section
        ref={ctaSection.ref}
        className="py-24 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-[100px] animate-[glow-pulse_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/20 rounded-full blur-[100px] animate-[glow-pulse_8s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[80px] animate-[scale-pulse_10s_ease-in-out_infinite]" />
        </div>

        {/* Floating stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-[15%] left-[10%] w-6 h-6 text-white/30 animate-[spin-slow_8s_linear_infinite]" />
          <Star className="absolute top-[25%] right-[15%] w-4 h-4 text-white/20 animate-[spin-slow_6s_linear_infinite_reverse]" />
          <Star className="absolute bottom-[20%] left-[20%] w-5 h-5 text-white/25 animate-[spin-slow_10s_linear_infinite]" />
          <Star className="absolute bottom-[30%] right-[10%] w-3 h-3 text-white/30 animate-[spin-slow_7s_linear_infinite_reverse]" />
          <Sparkles className="absolute top-[40%] left-[5%] w-8 h-8 text-white/20 animate-[icon-bounce_3s_ease-in-out_infinite]" />
          <Sparkles className="absolute bottom-[15%] right-[8%] w-6 h-6 text-white/25 animate-[icon-bounce_4s_ease-in-out_infinite_1s]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className={cn(
            "transition-all duration-700",
            ctaSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6 animate-[bounce-in_0.6s_ease-out]">
              <Camera className="w-4 h-4" />
              Book Your Experience
            </div>
          </div>

          <h2 className={cn(
            "text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 transition-all duration-700 delay-200",
            ctaSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            Want These Memories
            <span className="block mt-2">At Your Event?</span>
          </h2>

          <p className={cn(
            "text-xl sm:text-2xl text-white/80 mb-10 max-w-2xl mx-auto transition-all duration-700 delay-400",
            ctaSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            Book Your Photo Booth Experience Today And Create Unforgettable Moments
          </p>

          <div className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500",
            ctaSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <Button
              size="xl"
              className="bg-white text-primary-600 hover:bg-neutral-100 hover:scale-105 transition-all shadow-2xl shadow-black/20 group"
              asChild
            >
              <Link href="/book">
                Check Availability
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white hover:scale-105 transition-all group"
              asChild
            >
              <Link href="/">
                Learn More
                <Sparkles className="w-5 h-5 group-hover:animate-[spin-slow_1s_linear_infinite]" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox with animations */}
      {lightboxOpen && filteredItems[currentImageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-[fade-in_0.3s_ease-out]">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 flex items-center justify-center text-white transition-all z-10 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Navigation */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 flex items-center justify-center text-white transition-all group"
          >
            <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 flex items-center justify-center text-white transition-all group"
          >
            <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Image with animation */}
          <div className="max-w-5xl max-h-[80vh] mx-4 animate-[bounce-in_0.4s_ease-out]">
            <img
              src={filteredItems[currentImageIndex]?.src}
              alt={filteredItems[currentImageIndex]?.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />

            {/* Info with glass effect */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center bg-black/50 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/10">
              <p className="text-white font-bold text-xl">
                {filteredItems[currentImageIndex]?.event}
              </p>
              <p className="text-neutral-300 mt-1">
                {filteredItems[currentImageIndex]?.date} • {filteredItems[currentImageIndex]?.type === "video" ? "360° Video" : "Photo"}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {filteredItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/30 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
