"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Linkedin, Twitter, Globe } from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    sector: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simuler l'envoi du formulaire
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsSubmitting(false)

    // Reset après 3 secondes
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        sector: "",
        message: "",
      })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      content: ["123 Avenue de l'Innovation", "75001 Paris, France"],
      iconColor: "#2563eb",
      bgColor: "#dbeafe",
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: ["+33 1 23 45 67 89"],
      iconColor: "#059669",
      bgColor: "#d1fae5",
    },
    {
      icon: Mail,
      title: "Email",
      content: ["contact@Winksia.fr"],
      iconColor: "#7c3aed",
      bgColor: "#e9d5ff",
    },
    {
      icon: Clock,
      title: "Horaires",
      content: ["Lundi - Vendredi : 9h00 - 18h00", "Support 24h/7j disponible"],
      iconColor: "#ea580c",
      bgColor: "#fed7aa",
    },
  ]

  const socialLinks = [
    { icon: Linkedin, href: "#", color: "#0077b5" },
    { icon: Twitter, href: "#", color: "#1da1f2" },
    { icon: Globe, href: "#", color: "#6b7280" },
  ]

  return (
    <section className="px-6 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contactez-nous</h2>
          <p className="text-lg md:text-xl text-gray-600">
            Notre équipe d'experts est là pour vous accompagner dans vos projets IA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Informations de contact</h3>

            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: info.bgColor }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: info.iconColor }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                      {info.content.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-gray-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
                      style={{ backgroundColor: social.color }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Demo Request Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Demander une démo</h3>
            <p className="text-gray-600 mb-8">Découvrez comment Winksia peut transformer votre approche de l'IA</p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Votre prénom"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre.email@entreprise.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nom de votre entreprise"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    placeholder="Ex: Finance, Santé, E-commerce..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Décrivez vos besoins et objectifs IA..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Envoi en cours..." : "Demander une démo"}
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-4xl mb-4">✅</div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">Demande envoyée avec succès !</h4>
                <p className="text-green-700">
                  Notre équipe vous contactera dans les 24h pour planifier votre démonstration personnalisée.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
