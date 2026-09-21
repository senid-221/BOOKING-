"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  Smartphone,
} from "lucide-react";

const presets = [5000, 10000, 15000, 20000, 30000, 50000, 100000];

export default function Donation() {
  const [amount, setAmount] = useState(5000);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [donationId, setDonationId] = useState<string | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const r = await fetch("/api/donations/momo/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phone, name }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Unable to start donation");
      }

      setDonationId(d.donationId);
      setMsg(
        "Payment request yoherejwe kuri MTN MoMo. Emeza kuri telefoni yawe."
      );

      window.location.href =
        "/donation/success?donationId=" + encodeURIComponent(d.donationId);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Donation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page donation-page">
      <Link href="/" className="back">
        <ArrowLeft size={17} /> Back home
      </Link>

      <section className="donation-hero">
        <span className="donation-icon">
          <HeartHandshake size={28} />
        </span>
        <small>DONATION</small>
        <h1>Hitamo ubufasha bwawe.</h1>
        <p>
          Hitamo amafaranga ushaka gutanga kugira ngo ushyigikire BOOKING ikomeze
          gutera imbere.
        </p>
      </section>

      <div className="donation-layout">
        <form className="form-card" onSubmit={start}>
          <h2>Tanga donation</h2>

          <label>
            Amount (RWF)
            <div className="amount-grid">
              {presets.map((v) => (
                <button
                  type="button"
                  className={amount === v ? "amount active" : "amount"}
                  key={v}
                  onClick={() => setAmount(v)}
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>

          <label>
            Amazina (optional)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Amazina yawe"
            />
          </label>

          <label>
            MTN MoMo phone
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 7XX XXX XXX"
            />
          </label>

          <button className="primary full" disabled={loading} type="submit">
            {loading ? (
              <Loader2 size={17} className="spin" />
            ) : (
              <Smartphone size={17} />
            )}
            Donate with MTN MoMo <ArrowRight size={17} />
          </button>

          {msg && (
            <div className="admin-message">
              <CheckCircle2 size={17} />
              <span>{msg}</span>
            </div>
          )}
        </form>

        <aside className="donation-info">
          <div className="info-icon">
            <Smartphone size={23} />
          </div>
          <h2>MTN MoMo</h2>
          <p>
            Hitamo amount, shyiramo nimero ya MTN MoMo, hanyuma wemeze payment
            kuri telefoni yawe.
          </p>
          <div className="secure">
            <b>Payment status</b>
            <span>{donationId ? "PENDING" : "Not started"}</span>
          </div>
          <small>BOOKING ntizakira kandi ntibika PIN ya MoMo.</small>
        </aside>

      </div>
    </main>
  );
}
