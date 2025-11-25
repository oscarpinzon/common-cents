"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function HealthStatus() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    !baseUrl ? "error" : "loading"
  );

  useEffect(() => {
    if (!baseUrl) {
      return;
    }

    apiClient
      .GET("/api/health")
      .then(({ error }) => {
        if (error) throw new Error("Health check failed");
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [baseUrl]);

  return (
    <p>
      Backend health: <strong>{status}</strong>
    </p>
  );
}
