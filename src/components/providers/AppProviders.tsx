"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none"
      })
      .catch(() => {
        // ignore registration errors for MVP
      });
  }, []);

  return null;
}

export default function AppProviders(props: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ServiceWorkerRegistrar />
      {props.children}
    </SettingsProvider>
  );
}