import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // On reprend les configs Next.js et TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Désactivation des règles gênantes pour le build
  {
    rules: {
      // Autorise les apostrophes non échappées dans le JSX
      "react/no-unescaped-entities": "off",
      // Autorise l'usage de `any` explicite en TypeScript
      "@typescript-eslint/no-explicit-any": "off",
      // Ne signale plus les variables assignées mais jamais utilisées
      "@typescript-eslint/no-unused-vars": "off",
      // Ne signale plus les expressions isolées (ex. des ternaires sans assignation)
      "@typescript-eslint/no-unused-expressions": "off",
      // Autorise l'usage de <img> dans Next.js
      "@next/next/no-img-element": "off",
      // Désactive l'alerte sur les interfaces/typage vides
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off"
    },
  },
];

export default eslintConfig;
