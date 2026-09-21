"use client";

import { ArrowLeft, ArrowRight, CalendarDays, HeartHandshake, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="welcome-shell">
      <section className="welcome-screen">

        <div className="welcome-content">
          

          <p>
            Shaka service, hitamo igihe n&apos;aho uyishakira, hanyuma ukomeze
            intambwe ku yindi.
          </p>

          <div className="welcome-actions">
            <button
              className="welcome-primary"
              onClick={() => router.push("/services")}
            >
              Start Booking <ArrowRight size={18} />
            </button>

            <button
              className="welcome-secondary"
              onClick={() => router.push("/providers")}
            >
              <Users size={17} /> Provider Signup
            </button>

            <button
              className="welcome-secondary"
              onClick={() => router.push("/donation")}
            >
              <HeartHandshake size={17} /> Donation
            </button>
          </div>
        </div>

        <div className="welcome-footer">
          <button
            className="flow-back"
            onClick={() => router.back()}
            type="button"
          >
            <ArrowLeft size={17} /> Back
          </button>

          <div className="flow-dots">
            <span className="active" />
            <span />
            <span />
          </div>

          <button
            className="flow-next"
            onClick={() => router.push("/services")}
            type="button"
          >
            Next <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
