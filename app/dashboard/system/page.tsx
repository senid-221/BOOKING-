"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, Globe, ShieldCheck, XCircle } from "lucide-react";

type H = {
  database: string;
  nodeEnv: string;
  momoConfigured: boolean;
  appUrlConfigured: boolean;
};

export default function System() {
  const [h, setH] = useState<H | null>(null);

  useEffect(() => {
    fetch("/api/admin/health")
      .then((r) => (r.ok ? r.json() : null))
      .then(setH);
  }, []);

  return (
    <main className="admin-page">
      <Link href="/dashboard" className="back">
        <ArrowLeft size={17} /> Dashboard
      </Link>

      <div className="admin-page-head">
        <div>
          <small>SYSTEM HEALTH</small>
          <h1>System</h1>
          <p>Production readiness and service configuration.</p>
        </div>
      </div>

      <div className="health-grid">
        <div className="panel health-card">
          <Database />
          <small>Database</small>
          <b>{h?.database || "Checking..."}</b>
          {h?.database === "OK" ? (
            <CheckCircle2 className="ok" />
          ) : (
            <XCircle className="bad" />
          )}
        </div>

        <div className="panel health-card">
          <ShieldCheck />
          <small>MTN MoMo configuration</small>
          <b>{h?.momoConfigured ? "Configured" : "Missing"}</b>
          {h?.momoConfigured ? (
            <CheckCircle2 className="ok" />
          ) : (
            <XCircle className="bad" />
          )}
        </div>

        <div className="panel health-card">
          <Globe />
          <small>APP_URL</small>
          <b>{h?.appUrlConfigured ? "Configured" : "Missing"}</b>
          {h?.appUrlConfigured ? (
            <CheckCircle2 className="ok" />
          ) : (
            <XCircle className="bad" />
          )}
        </div>
      </div>

      <div className="panel system-note">
        <h2>Production checklist</h2>
        <p>
          Run database migrations before deployment, configure secrets in hosting,
          verify MTN MoMo sandbox first, then switch to production credentials only
          after end-to-end testing.
        </p>
      </div>
    </main>
  );
}
