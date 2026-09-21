"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, Users } from "lucide-react";

type ServiceSummary = {
  id: string;
  name: string;
  monthlyFee: number;
  maxProviders: number;
  active: number;
};

type ProviderSummary = {
  id: string;
  fullName: string;
  phone: string;
  service: string;
};

export default function ProviderDirectory() {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/public/providers", { cache: "no-store" });
        if (!response.ok) return;

        const result = await response.json();

        if (active) {
          setServices(result?.services ?? []);
          setProviders(result?.providers ?? []);
        }
      } catch {
        if (active) {
          setServices([]);
          setProviders([]);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredProviders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesService = !selected || provider.service === selected;
      const searchable = (
        provider.fullName +
        " " +
        provider.service +
        " " +
        provider.phone
      ).toLowerCase();

      return matchesService && searchable.includes(normalizedQuery);
    });
  }, [providers, selected, query]);

  return (
    <main className="public-page">
      <Link href="/services" className="back">
        <ArrowLeft size={17} /> Services
      </Link>

      <div className="directory-hero">
        <small>PROVIDER DIRECTORY</small>
        <h1>Shaka uwagufasha.</h1>
        

        <div className="directory-tools">
          <div className="admin-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search provider or service..."
            />
          </div>

          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
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
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <article className="provider-public-card" key={provider.id}>
              <span className="public-provider-icon">
                <Users size={21} />
              </span>

              <small>{provider.service}</small>
              <h2>{provider.fullName}</h2>
              <p>ACTIVE provider</p>

              <Link
                className="primary full"
                href={"/booking?service=" + encodeURIComponent(provider.service)}
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
