"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Send, Users } from "lucide-react";

type N = {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdAt: string;
};

export default function Notifications() {
  const [data, setData] = useState<N[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL_PROVIDERS");
  const [result, setResult] = useState("");

  useEffect(() => {
    fetch("/api/admin/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setData);
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setResult("");

    const r = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message, audience }),
    });

    const d = await r.json();

    if (!r.ok) {
      setResult(d.error || "Failed");
      return;
    }

    setResult("Notification saved and queued.");
    setTitle("");
    setMessage("");

    const x = await fetch("/api/admin/notifications", { cache: "no-store" });
    if (x.ok) setData(await x.json());
  }

  return (
    <main className="admin-page">
      <Link href="/dashboard" className="back">
        <ArrowLeft size={17} /> Dashboard
      </Link>

      <div className="admin-page-head">
        <div>
          <small>NOTIFICATIONS</small>
          <h1>Notifications</h1>
          <p>Send system updates to providers.</p>
        </div>
      </div>

      <div className="notify-grid">
        <form className="panel notify-form" onSubmit={send}>
          <div className="notify-title">
            <Bell size={19} />
            <h2>New notification</h2>
          </div>

          <label>
            Audience
            <select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="ALL_PROVIDERS">All providers</option>
              <option value="ACTIVE_PROVIDERS">Active providers</option>
              <option value="BLOCKED_PROVIDERS">Blocked providers</option>
            </select>
          </label>

          <label>
            Title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Subscription reminder"
            />
          </label>

          <label>
            Message
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Write your notification..."
            />
          </label>

          <button className="primary" type="submit">
            <Send size={17} /> Send notification
          </button>

          {result && <div className="admin-message">{result}</div>}
        </form>

        <div className="panel notify-history">
          <div className="notify-title">
            <Users size={19} />
            <h2>Recent notifications</h2>
          </div>

          {data.map((n) => (
            <div className="notify-row" key={n.id}>
              <div>
                <b>{n.title}</b>
                <p>{n.message}</p>
                <small>
                  {n.audience} · {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
