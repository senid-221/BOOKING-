"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, CalendarDays, Utensils, Coffee, Sparkles, Hotel, Scissors, Dumbbell, Music2, Car, ShoppingBag, Wrench } from "lucide-react";

const items = [
  ["Food Ordering","Tegura ibiryo ubone delivery byoroshye.",Utensils],
  ["Drinks Ordering","Tegeka ibinyobwa ukunda.",Coffee],
  ["Beauty Services","Shaka beauty service kandi uyibuke.",Sparkles],
  ["Room Booking","Book room yawe mbere y'urugendo.",Hotel],
  ["Salon Booking","Hitamo salon n'isaha ikubereye.",Scissors],
  ["Physiotherapy","Book gahunda ya physiotherapy.",Dumbbell],
  ["Studio Recording","Shaka studio yo gufatiramo umuziki.",Music2],
  ["Transport / Tickets","Tegura transport cyangwa ticket.",Car],
  ["Shopping","Shaka ibyo ukeneye ubitegeke.",ShoppingBag],
  ["Installation","Book service yo gushyiramo cyangwa gusana.",Wrench],
] as const;

export default function Services() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => items.filter(([t, d]) => (t + " " + d).toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  return (
    <main className="system-shell">
      <div className="system-page">
        <div className="system-top">
          <Link href="/" className="back"><ArrowLeft size={17}/> Back</Link>
          <div className="system-brand"><span><CalendarDays size={16}/></span> BOOKING</div>
          <Link href="/providers" className="system-link">Provider Signup</Link>
        </div>

        <div className="system-header">
          <div>
            <small>STEP 02</small>
            <h1>Choose a service</h1>
            <p>Hitamo service ushaka. System izakujyana kuri booking intambwe ku yindi.</p>
          </div>

          <div className="compact-search">
            <Search size={16}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search service..." />
          </div>
        </div>

        <div className="service-cards">
          {filtered.map(([title, desc, Icon], i) => (
            <Link
              href={"/booking?service=" + encodeURIComponent(title)}
              className="mini-service-card"
              key={title}
            >
              <span className="mini-service-icon"><Icon size={19}/></span>
              <div>
                <b>{title}</b>
                <p>{desc}</p>
              </div>
              <ArrowRight size={17}/>
            </Link>
          ))}
        </div>

        <div className="system-footer">
          <Link href="/" className="flow-back"><ArrowLeft size={16}/> Back</Link>
          <div className="flow-dots"><span/><span className="active"/><span/></div>
          <Link href={filtered[0] ? "/booking?service="+encodeURIComponent(filtered[0][0]) : "/booking"} className="flow-next">Next <ArrowRight size={16}/></Link>
        </div>
      </div>
    </main>
  );
}
