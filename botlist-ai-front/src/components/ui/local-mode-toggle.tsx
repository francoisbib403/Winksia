"use client";

import { useState, useEffect } from "react";
import { checkLocalMode, setLocalMode } from "@/lib/localTools";

export default function LocalModeToggle() {
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLocalMode(checkLocalMode());
  }, []);

  const handleToggle = () => {
    const newMode = !isLocalMode;
    setIsLocalMode(newMode);
    setLocalMode(newMode);
    
    // Recharger la page pour appliquer le changement
    window.location.reload();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Mode local:</span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isLocalMode ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isLocalMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-xs font-medium ${
          isLocalMode ? "text-blue-600" : "text-gray-500"
        }`}>
          {isLocalMode ? "Activé" : "Désactivé"}
        </span>
      </div>
      {isLocalMode && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
          📦 Utilisation des outils en localStorage
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        <div className="font-medium mb-1">Comment activer le mode local :</div>
        <ol className="list-decimal list-inside space-y-1">
          <li>Cliquez sur le bouton ci-dessus</li>
          <li>La page se rechargera automatiquement</li>
          <li>Les outils de démo seront chargés</li>
          <li>Testez sans connexion API !</li>
        </ol>
      </div>
    </div>
  );
}
