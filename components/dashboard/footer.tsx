"use client"

import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-background to-slate-950 mt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl -ml-48 -mb-48" />
      </div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Join Our Community</h3>
              <p className="text-lg text-gray-300">
                Get tips, updates, and exclusive features delivered to your inbox.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center gap-2 group">
                Subscribe
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
                  LifeHub
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Organize your life, achieve your goals, and live with purpose. All in one powerful dashboard.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mt-8">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:hello@lifehub.com" className="hover:text-white transition-colors">
                    hello@lifehub.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Product</h5>
              <ul className="space-y-3">
                {["Features", "Dashboard", "Pricing", "Security"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group"
                    >
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Company</h5>
              <ul className="space-y-3">
                {["About Us", "Blog", "Careers", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group"
                    >
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="font-bold text-white mb-6 text-lg">Resources</h5>
              <ul className="space-y-3">
                {["Help Center", "Documentation", "Status Page", "Legal"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2 group"
                    >
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social & Bottom Bar */}
          <div className="border-t border-white/10 pt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                {["Twitter", "Instagram", "LinkedIn", "Discord"].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-all hover:scale-110 group"
                  >
                    <span className="text-xs font-bold">{platform[0]}</span>
                  </a>
                ))}
              </div>

              <p className="text-gray-400 text-sm">© {currentYear} LifeHub. All rights reserved.</p>

              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
