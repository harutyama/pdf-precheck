import { sanitizeAnalyticsParams, type AnalyticsParams } from "./events.ts";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(value.trim());
}

export function isAnalyticsConfigured(): boolean {
  return isMeasurementId(MEASUREMENT_ID);
}

export function initAnalytics(): void {
  if (!isAnalyticsConfigured() || typeof document === "undefined") return;
  if (document.getElementById("ga4-gtag")) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // Google 公式と同じく arguments を積む。配列だと計測されないことがある。
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID.trim(), {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.id = "ga4-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID.trim())}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (!isAnalyticsConfigured() || typeof window === "undefined" || !window.gtag) {
    return;
  }
  window.gtag("event", name, sanitizeAnalyticsParams(params));
}
