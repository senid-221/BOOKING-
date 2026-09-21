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
    async function load() {
      try {
        const response = await fetch("/api/public/providers");
        if (!response.ok) return;

        const result = await response.json();
        setServices(result.services ?? []);
        setProviders(result.providers ?? []);
      } catch {
        setServices([]);
        setProviders([]);
      }
    }

    load();
  }, []);

  const list = useMemo(() => {
    const query = q.toLowerCase();

    return providers.filter((p) => {
      const serviceMatch = !selected || p.service === selected;
      const textMatch = (p.fullName + " " + p.service)
        .toLowerCase()
        .includes(query);

      return serviceMatch && textMatch;
    });
  }, [providers, selected, q]);

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

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="directory-grid">
        {list.length > 0 ? (
          list.map((provider) => (
            <article className="provider-public-card" key={provider.id}>
              <span className="public-provider-icon">
                <Users size={21} />
              </span>

              <small>{provider.service}</small>
              <h2>{provider.fullName}</h2>
              <p>ACTIVE provider</p>

              <Link
                className="primary full"
                href={
                  "/booking?service=" +
                  encodeURIComponent(provider.service)
                }
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

        {services.map((service) => (
          <div key={service.id}>
            <span>{service.name}</span>
            <b>
              {service.active}/{service.maxProviders}
            </b>
          </div>
        ))}
      </div>
    </main>
  );
}
