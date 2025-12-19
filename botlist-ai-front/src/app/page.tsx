import Header from "@/app/components/header"
import HeroSection from "@/app/components/hero-section"
import StatsSection from "@/app/components/stats-section"
import FeaturesSection from "@/app/components/features-section"
import AboutSection from "@/app/components/about-section"
import TestimonialsSection from "@/app/components/testimonials-section"
import NewsletterSection from "@/app/components/newsletter-section"
import ContactSection from "@/app/components/contact-section"

import Footer from "@/app/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section with Navy Blue Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
        {/* Hexagonal Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
                <polygon
                  points="10,1 18.66,6 18.66,14 10,19 1.34,14 1.34,6"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border border-white/20 rotate-45"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border border-white/20 rotate-12"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 border border-white/20 rotate-45"></div>
        <div className="absolute bottom-20 right-40 w-24 h-24 border border-white/20 rotate-12"></div>

        <HeroSection />
        <StatsSection />
      </div>

      {/* Features Section */}
      <FeaturesSection />

      <AboutSection />

      <div className="bg-gradient-to-r from-blue-900 to-blue-800">
        <TestimonialsSection />
      </div>

      <ContactSection />

      <NewsletterSection />

      <Footer />
    </div>
  )
}
