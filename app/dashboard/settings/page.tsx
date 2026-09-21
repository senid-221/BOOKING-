"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Save, ShieldCheck } from "lucide-react";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setUsername(d.username || "");
          setSecret(d.sessionSecretSet ? "Configured" : "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const r = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        sessionSecret: secret === "Configured" ? "" : secret,
      }),
    });

    const d = await r.json();
    setMessage(
      r.ok ? d.message || "Settings saved." : d.error || "Unable to save settings."
    );
  }

  return (
    <main className="admin-page">
      <Link href="/dashboard" className="back">
        <ArrowLeft size={17} /> Dashboard
      </Link>

      <div className="admin-page-head">
        <div>
          <small>ADMIN SECURITY</small>
          <h1>Settings</h1>
          <p>Admin credentials and security configuration.</p>
        </div>
      </div>

      <div className="settings-grid">
        <form className="panel settings-card" onSubmit={save}>
          <h2>Admin account</h2>

          <label>
            Admin username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label>
            New session secret
            <input
              type="password"
              value={secret === "Configured" ? "" : secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Leave blank to keep existing"
            />
          </label>

          <button className="primary" type="submit">
            <Save size={17} /> Save settings
          </button>

          {message && (
            <div className="admin-message">
              <CheckCircle2 size={17} /> {message}
            </div>
          )}
        </form>

        <aside className="panel security-card">
          <ShieldCheck size={28} />
          <h2>Security</h2>
          <p>
            Production credentials should stay in hosting environment variables.
            Do not commit passwords or API keys to GitHub.
          </p>
          {loading ? (
            <small>Checking configuration...</small>
          ) : (
            <small>
              Session secret: {secret === "Configured" ? "Configured" : "Protected by environment"}
            </small>
          )}
        </aside>
      </div>
    </main>
  );
}
