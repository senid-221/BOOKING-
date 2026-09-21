"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, Users } from "lucide-react";

type S = {
  id: string;
  name: string;
  monthlyFee: number;
  maxProviders: number;
  active: number;
};

type P = {
  id: string;
  fullName: string;
  phone: string;
  service: string;
};

export default function ProviderDirectory() {
  const [services, setServices] = useState<S[]>([]);
  const [providers, setProviders] = useState<P[]>([]);
  const [selected, setSelected] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/public/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setServices(d.services);
          setProviders(d.providers);
        }
      });
  }, []);

  const list = useMemo(
    () =>
      providers.filter(
        (p) =>
          (!selected || p.service === selected) &&
          (p.fullName + " " + p.service)
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [providers, selected, q]
  );

  return (
    <main className="public-page">
      <Link href="/services" className="back">
        <ArrowLeft size={17} /> Services
      </Link>

      <div className="directory-hero">
        <small>PROVIDER DIRECTORY</small>
        <h1>Shaka uwagufasha.</h1>
        <p>Abatanga service bafite ACTIVE status gusa ni bo berekana hano.</p>

        <div className="directory-tools">
          <div className="admin-search">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search provider or service..."
            />
          </div>

          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">All services</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="directory-grid">
        {list.length ? (
          list.map((p) => (
            <article className="provider-public-card" key={p.id}>
              <span className="public-provider-icon">
                <Users size={21} />
              </span>
              <small>{p.service}</small>
              <h2>{p.fullName}</h2>
              <p>ACTIVE provider</p>
              <Link
                className="primary full"
                href={"/booking?service=" + encodeURIComponent(p.service)}
              >
                Book service <ArrowRight size={16} />
              </Link>
            </article>
          ))
        ) : (
          <div className="empty">
            Nta active provider yabonetse kuri iri shaka.
          </div>
        )}
      </div>

      <div className="service-capacity-public">
        <h3>Service availability</h3>
        {services.map((s) => (
          <div key={s.id}>
            <span>{s.name}</span>
            <b>{s.active}/{s.maxProviders}</b>
          </div>
        ))}
      </div>
    </main>
  );
}
