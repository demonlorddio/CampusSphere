import { globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";

const { flatConfig } = nextPlugin;

const eslintConfig = [
  globalIgnores([".next/**", "node_modules/**", "out/**", "build/**", "coverage/**"]),
  flatConfig.recommended,
  flatConfig.coreWebVitals,
];

export default eslintConfig;
