"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, RefreshCw, Search, XCircle } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  status: string;
  method: string;
  reference: string | null;
  provider: string;
  phone: string;
  service: string;
  createdAt: string;
  paidAt: string | null;
};

export default function Payments() {
  const [data, setData] = useState<Payment[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/payments", { cache: "no-store" });
    if (r.ok) setData(await r.json());
    else setMsg("Unable to load payments");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(n);

  const list = data.filter(
    (p) =>
      (filter === "ALL" || p.status === filter) &&
      (p.provider + " " + p.phone + " " + (p.reference || "") + " " + p.service)
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
          <small>MTN MOMO PAYMENTS</small>
          <h1>Payments</h1>
          <p>Reba subscriptions, references n'uko payment zigeze.</p>
        </div>

        <div className="payment-toolbar">
          <div className="admin-search">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search payment..."
            />
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="PENDING">PENDING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>

          <button className="refresh" onClick={load} type="button">
            <RefreshCw size={17} /> Refresh
          </button>
        </div>
      </div>

      {msg && <div className="admin-message">{msg}</div>}

      <div className="admin-table panel">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading payments...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.provider}</b>
                      <small className="cell-small">{p.phone}</small>
                    </td>
                    <td>{p.service}</td>
                    <td>{fmt(p.amount)}</td>
                    <td>{p.method}</td>
                    <td>
                      <code>{p.reference || "—"}</code>
                    </td>
                    <td>
                      {p.status === "SUCCESS" ? (
                        <span className="status active">
                          <CheckCircle2 size={12} /> SUCCESS
                        </span>
                      ) : p.status === "FAILED" ? (
                        <span className="status suspended">
                          <XCircle size={12} /> FAILED
                        </span>
                      ) : (
                        <span className="status pending">
                          <Clock3 size={12} /> PENDING
                        </span>
                      )}
                    </td>
                    <td>{new Date(p.paidAt || p.createdAt).toLocaleString()}</td>
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
