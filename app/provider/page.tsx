"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react";

type Data = {
  provider: {
    id: string;
    fullName: string;
    phone: string;
    service: string;
    status: string;
    subscriptionEndsAt: string | null;
  };
  bookings: {
    id: string;
    customerName: string;
    phone: string;
    date: string | null;
    time: string | null;
    location: string | null;
    status: string;
  }[];
};

export default function ProviderHome() {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/provider/me", { cache: "no-store" });

        if (r.status === 401 || r.status === 403) {
          router.replace("/providers/login");
          return;
        }

        if (!r.ok) {
          throw new Error("Unable to load account");
        }

        setData(await r.json());
      } catch (error) {
        setMsg(error instanceof Error ? error.message : "Unable to load account");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function logout() {
    await fetch("/api/providers/logout", { method: "POST" });
    router.replace("/providers/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="provider-dashboard">
        <div className="loading">Loading provider dashboard...</div>
      </main>
    );
  }

  return (
    <main className="provider-dashboard">
      <header className="provider-dash-head">
        <div>
          <small>PROVIDER PORTAL</small>
          <h1>Murakaza neza, {data?.provider.fullName}</h1>
          <p>
            <UserRound size={15} /> {data?.provider.service}
          </p>
        </div>

        <div className="provider-head-actions">
          <button
            className="secondary"
            type="button"
            onClick={() => router.push("/provider/notifications")}
          >
            <Bell size={16} /> Notifications
          </button>

          <button
            className="secondary"
            type="button"
            onClick={() => router.push("/provider/bookings")}
          >
            <CalendarDays size={16} /> Bookings
          </button>

          <button
            className="secondary"
            type="button"
            onClick={() => router.push("/provider/subscription")}
          >
            <Wallet size={16} /> Subscription
          </button>

          <button className="logout light" type="button" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {msg && <div className="login-error">{msg}</div>}

      <section className="provider-stats">
        <div>
          <CheckCircle2 />
          <span>Account</span>
          <b>{data?.provider.status ?? "—"}</b>
        </div>

        <div>
          <CalendarDays />
          <span>Bookings</span>
          <b>{data?.bookings.length ?? 0}</b>
        </div>

        <div>
          <Clock3 />
          <span>Subscription</span>
          <b>
            {data?.provider.subscriptionEndsAt
              ? new Date(data.provider.subscriptionEndsAt).toLocaleDateString()
              : "—"}
          </b>
        </div>
      </section>

      <section className="provider-bookings">
        <div className="provider-section-title">
          <div>
            <small>RECENT BOOKINGS</small>
            <h2>Customer bookings</h2>
          </div>
        </div>

        {data?.bookings?.length ? (
          data.bookings.slice(0, 5).map((b) => (
            <div className="provider-booking" key={b.id}>
              <div>
                <b>{b.customerName}</b>
                <span>
                  <Phone size={13} /> {b.phone}
                </span>
              </div>

              <div>
                <span>
                  <CalendarDays size={13} /> {b.date || "—"} {b.time || ""}
                </span>
                <span>
                  <MapPin size={13} /> {b.location || "—"}
                </span>
              </div>

              <span className={"status " + b.status.toLowerCase()}>
                {b.status}
              </span>
            </div>
          ))
        ) : (
          <div className="empty">Nta booking ufite ubu.</div>
        )}
      </section>
    </main>
  );
}
