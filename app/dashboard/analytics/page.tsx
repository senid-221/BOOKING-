"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  HeartHandshake,
  Users,
  Wallet,
} from "lucide-react";

type Analytics = {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  providers: {
    total: number;
    active: number;
    blocked: number;
    suspended: number;
  };
  payments: {
    successful: number;
    pending: number;
    failed: number;
    revenue: number;
  };
  donations: {
    successful: number;
    pending: number;
    failed: number;
    total: number;
  };
  contacts: {
    new: number;
    inProgress: number;
    resolved: number;
  };
  services: {
    name: string;
    bookings: number;
    activeProviders: number;
    capacity: number;
  }[];
};

export default function Analytics() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData);
  }, []);

  const money = (n: number) =>
    new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(n);

  if (!data) {
    return (
      <main className="admin-page">
        <div className="loading">Loading analytics...</div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <Link href="/dashboard" className="back">
        <ArrowLeft size={17} /> Dashboard
      </Link>

      <div className="admin-page-head">
        <div>
          <small>ANALYTICS & REPORTS</small>
          <h1>Analytics</h1>
          <p>System performance, bookings, providers, payments and support.</p>
        </div>
      </div>

      <section className="analytics-kpi">
        <div>
          <BarChart3 />
          <small>Total bookings</small>
          <b>{data.bookings.total}</b>
        </div>
        <div>
          <Users />
          <small>Active providers</small>
          <b>
            {data.providers.active}/{data.providers.total}
          </b>
        </div>
        <div>
          <Wallet />
          <small>Provider revenue</small>
          <b>{money(data.payments.revenue)}</b>
        </div>
        <div>
          <HeartHandshake />
          <small>Donations</small>
          <b>{money(data.donations.total)}</b>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="panel analytics-card">
          <h2>Booking status</h2>
          <div className="metric-list">
            <span>Pending<b>{data.bookings.pending}</b></span>
            <span>Confirmed<b>{data.bookings.confirmed}</b></span>
            <span>Completed<b>{data.bookings.completed}</b></span>
            <span>Cancelled<b>{data.bookings.cancelled}</b></span>
          </div>
        </div>

        <div className="panel analytics-card">
          <h2>Providers</h2>
          <div className="metric-list">
            <span>Active<b>{data.providers.active}</b></span>
            <span>Blocked<b>{data.providers.blocked}</b></span>
            <span>Suspended<b>{data.providers.suspended}</b></span>
          </div>
        </div>

        <div className="panel analytics-card">
          <h2>Payments</h2>
          <div className="metric-list">
            <span>Successful<b>{data.payments.successful}</b></span>
            <span>Pending<b>{data.payments.pending}</b></span>
            <span>Failed<b>{data.payments.failed}</b></span>
            <span>Revenue<b>{money(data.payments.revenue)}</b></span>
          </div>
        </div>

        <div className="panel analytics-card">
          <h2>Donations</h2>
          <div className="metric-list">
            <span>Successful<b>{data.donations.successful}</b></span>
            <span>Pending<b>{data.donations.pending}</b></span>
            <span>Failed<b>{data.donations.failed}</b></span>
            <span>Total<b>{money(data.donations.total)}</b></span>
          </div>
        </div>

        <div className="panel analytics-card">
          <h2>Contact inbox</h2>
          <div className="metric-list">
            <span>New<b>{data.contacts.new}</b></span>
            <span>In progress<b>{data.contacts.inProgress}</b></span>
            <span>Resolved<b>{data.contacts.resolved}</b></span>
          </div>
        </div>
      </section>

      <section className="panel analytics-services">
        <div className="panel-head">
          <div>
            <small>SERVICE UTILIZATION</small>
            <h2>Bookings by service</h2>
          </div>
        </div>

        {data.services.map((s) => {
          const utilization = s.capacity
            ? Math.min(100, (s.activeProviders / s.capacity) * 100)
            : 0;

          return (
            <div className="analytics-service" key={s.name}>
              <div>
                <b>{s.name}</b>
                <span>
                  {s.bookings} bookings · {s.activeProviders}/{s.capacity} providers
                </span>
              </div>
              <div className="bar">
                <i style={{ width: `${utilization}%` }} />
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
