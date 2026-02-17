import Link from "next/link";

const footerLinks = {
  services: [
    { name: "Stand-Alone Photo Booth", href: "/services/stand-alone" },
    { name: "360 Booth Experience", href: "/services/360-booth" },
    { name: "Corporate Events", href: "/corporate" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
    { name: "Referral Program", href: "/referrals" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold text-white">
              Capture<span className="text-primary-400">The</span>Moment
            </Link>
            <p className="mt-4 text-sm text-neutral-400">
              Premium photo booth experiences for corporate events and upscale
              celebrations throughout Southern California.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Services
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="tel:+19495550123"
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  (949) 555-0123
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@capturethemomentphotobooths.com"
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  hello@capturethemoment...
                </a>
              </li>
              <li className="text-sm text-neutral-400">
                Orange County, CA
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-500 text-center">
            &copy; {new Date().getFullYear()} Capture The Moment Photo Booths.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
