"use client"

import React from "react"
import { X } from "lucide-react"
import { renderStars, renderCapabilityBar } from "@/utils/renderers"

interface ToolDisplay {
  id: string
  name: string
  company: string
  category: string
  description: string
  fullDescription: string
  rating: number
  reviews: number
  price: string
  priceType: string
  tags: string[]
  functions: string[]
  domains: string[]
  useCases: string[]
  advantages: string[]
  concerns: string[]
  businessValue: string
  roi: string
  integration: string
  capabilities: {
    [key: string]: number
  }
  featured: boolean
}

interface CompareToolsModalProps {
  tools: ToolDisplay[]
  onClose: () => void
  onRemoveTool: (toolId: string) => void
}

export default function CompareToolsModal({ tools, onClose, onRemoveTool }: CompareToolsModalProps) {
  if (tools.length === 0) return null

  const criteria = [
    { key: "category", label: "Catégorie" },
    { key: "price", label: "Prix" },
    { key: "rating", label: "Note utilisateurs" },
    { key: "capabilities.Capacité IA", label: "Capacité IA" },
    { key: "capabilities.Facilité d'usage", label: "Facilité d'usage" },
    { key: "capabilities.Intégration", label: "Intégration" },
    { key: "roi", label: "ROI estimé" },
    { key: "functions", label: "Fonctions principales" },
  ]

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Comparaison des Outils ({tools.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tools Overview */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-gray-50 rounded-xl p-4 relative">
              <button
                onClick={() => onRemoveTool(tool.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.company}</p>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Note</span>
                {renderStars(tool.rating)}
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Prix</span>
                <p className="text-green-600 font-bold">{tool.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6">
            Comparez les fonctionnalités, prix et performances de vos outils sélectionnés
          </p>
          <div className="grid grid-cols-[1fr_repeat(2,1fr)] gap-4">
            {/* Header Row */}
            <div className="font-semibold text-gray-900 py-3 border-b border-gray-200">Critères</div>
            {tools.map((tool) => (
              <div key={tool.id} className="font-semibold text-gray-900 py-3 border-b border-gray-200">
                {tool.name}
              </div>
            ))}

            {/* Data Rows */}
            {criteria.map((criterion) => (
              <React.Fragment key={criterion.key}>
                <div className="text-gray-700 py-3 border-b border-gray-100">{criterion.label}</div>
                {tools.map((tool) => (
                  <div key={tool.id} className="py-3 border-b border-gray-100">
                    {criterion.key === "rating" ? (
                      renderStars(tool.rating, tool.reviews)
                    ) : criterion.key.startsWith("capabilities.") ? (
                      renderCapabilityBar(
                        "", // Label is already in the criteria row
                        getNestedValue(tool, criterion.key) as number,
                      )
                    ) : criterion.key === "functions" ? (
                      <div className="flex flex-wrap gap-2">
                        {tool.functions.map((func, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {func}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className={criterion.key === "price" ? "text-green-600 font-bold" : "text-gray-700"}>
                        {getNestedValue(tool, criterion.key)}
                      </span>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
