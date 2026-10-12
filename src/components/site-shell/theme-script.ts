// Plain module (not "use client") so the root layout can inline the script.

export const THEME_KEY = "mb-theme";

/**
 * Runs before first paint, inline in the root layout, so a saved light theme
 * never flashes dark. It sets an attribute on <html>, which survives client
 * navigation between the site, build and preview layouts.
 */
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="light")document.documentElement.setAttribute("data-mb-theme","light")}catch(e){}`;
