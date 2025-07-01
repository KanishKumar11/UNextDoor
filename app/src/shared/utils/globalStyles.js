import { createGlobalStylesWeb } from "@gluestack-style/react";

// Define global styles for web
export const globalStyles = createGlobalStylesWeb({
  // Apply to all elements
  "*": {
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
  },

  // Body styles
  body: {
    fontFamily:
      'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: 400,
    backgroundColor: "#FFFFFF",
    color: "#000000",
    lineHeight: 1.5,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },

  // Form elements
  "input, button, textarea, select": {
    fontFamily: "inherit",
    fontSize: "inherit",
    color: "inherit",
    border: "none",
    outline: "none",
  },

  // Links
  a: {
    color: "$primary500",
    textDecoration: "none",
  },

  // Headings
  "h1, h2, h3, h4, h5, h6": {
    fontWeight: "bold",
    lineHeight: 1.2,
    color: "$neutral900",
  },
});
