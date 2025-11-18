"use client";

import { useEffect, useState } from "react";

type Health = { status: string };

export function HealthStatus() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    !baseUrl ? "error" : "loading"
  );

  useEffect(() => {
    if (!baseUrl) {
      return;
    }

    fetch(`${baseUrl}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json() as Promise<Health>;
      })
      .then((data) => setStatus(data.status as "ok"))
      .catch(() => setStatus("error"));
  }, [baseUrl]);

  return (
    <p>
      Backend health: <strong>{status}</strong>
    </p>
  );
}
