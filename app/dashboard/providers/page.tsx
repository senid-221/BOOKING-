"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Search, ShieldAlert } from "lucide-react";

type Provider = {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  service: string;
  subscriptionEndsAt: string | null;
};

export default function ProvidersAdmin() {
  const [data, setData] = useState<Provider[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/providers", { cache: "no-store" });
    if (r.ok) setData(await r.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function change(id: string, status: "ACTIVE" | "BLOCKED" | "SUSPENDED") {
    setMessage("");
    const r = await fetch("/api/admin/providers/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();

    if (!r.ok) {
      setMessage(d.error || "Update failed");
      return;
    }

    setMessage("Provider status updated.");
    load();
  }

  const list = data.filter((p) =>
    (p.fullName + " " + p.phone + " " + p.service)
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <main className="admin-page">
      <Link href="/dashboard" className="back">
        <ArrowLeft size={17} /> Dashboard
      </Link>

      <div className="admin-page-head">
        <div>
          <small>PROVIDER MANAGEMENT</small>
          <h1>Providers</h1>
          <p>Manage BLOCKED, ACTIVE and SUSPENDED providers.</p>
        </div>

        <div className="admin-search">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search provider..."
          />
        </div>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-table panel">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading providers...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Subscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.fullName}</b></td>
                    <td>{p.service}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span className={"status " + p.status.toLowerCase()}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.subscriptionEndsAt
                        ? new Date(p.subscriptionEndsAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="row-actions">
                        {p.status !== "ACTIVE" && (
                          <button type="button" onClick={() => change(p.id, "ACTIVE")}>
                            <CheckCircle2 size={15} /> Activate
                          </button>
                        )}
                        {p.status !== "BLOCKED" && (
                          <button type="button" onClick={() => change(p.id, "BLOCKED")}>
                            <Clock3 size={15} /> Block
                          </button>
                        )}
                        {p.status !== "SUSPENDED" && (
                          <button type="button" onClick={() => change(p.id, "SUSPENDED")}>
                            <ShieldAlert size={15} /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
