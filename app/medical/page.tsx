import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { CLINICS } from "@/lib/clinics";
import { SPECIALTIES } from "@/lib/specialties";
import ClinicMap from "@/components/medical/clinic-map";

export const dynamic = "force-dynamic";

export default function MedicalPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Medical" },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-foreground">
            Swiss CLINICS AND MEDICAL CHECK-UPS
          </h1>
          <p className="max-w-3xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Find the ideal hospitals and clinics in Switzerland for your
            specific needs. Browse our directory of leading hospitals and
            doctors, or contact us for personalized assistance.
          </p>
        </div>

        {/* Info section */}
        <div className="mb-10 space-y-6">
          <section className="rounded-md border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
              Swiss Private Hospitals – A quick overview
            </h2>
            <div className="space-y-4 text-[0.88rem] leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Advanced Technology:</strong>{" "}
                Get access to the latest medical innovations and technologies,
                as well as highly skilled professionals with experienced and
                internationally recognized doctors and specialists.
              </p>
              <p>
                <strong className="text-foreground">Superior Facilities:</strong>{" "}
                State-of-the-art hospitals and clinics with comfortable, private
                environments and of course the confidentiality and discretion
                with strict adherence to patient privacy.
              </p>
              <p>
                Find the ideal hospitals and clinics in Switzerland for your
                specific needs. You can browse our directory and explore
                detailed profiles of leading hospitals and doctors. Or you
                contact us directly and get in touch for personalized assistance
                and information. Our medical experts can organize your
                treatment: we&rsquo;ll handle every detail, from appointments to
                travel arrangements.
              </p>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
              Our experts help you organize the best possible treatment
            </h2>
            <div className="space-y-4 text-[0.88rem] leading-relaxed text-muted-foreground">
              <p>
                For 22 years, we&rsquo;ve helped patients find the best doctors
                in Switzerland. We have a large network, so you get fast access
                to top specialists. Our team takes care of everything: booking
                hotels at good prices, arranging transportation, and managing
                complex cases with many doctors. We are an official member of
                the Swiss government&rsquo;s tourism organization, so you know
                you can trust us to provide a high-quality and well-organized
                medical experience.
              </p>
            </div>
          </section>
        </div>

        {/* Clinic map */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
              Clinics by region
            </h2>
            <p className="mt-1 max-w-3xl text-[0.88rem] leading-relaxed text-muted-foreground">
              Our hospitals and clinics across Switzerland, colour-coded by
              region. Click a dot to open the clinic&rsquo;s page.
            </p>
          </div>
          <ClinicMap />
        </section>

        {/* Medical Specialties */}
        <section className="mb-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
            Medical specialties
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.entries(SPECIALTIES).map(([slug, s]) => (
              <Link
                key={slug}
                href={`/medical/${slug}`}
                className="rounded-sm border border-border px-3 py-2 text-[0.82rem] text-link transition-colors hover:border-primary/50 hover:bg-card-hover"
              >
                {s.name} &rarr;
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Hospitals */}
        <section className="mb-10">
          <h2 className="mb-4 font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
            Best hospitals in Switzerland
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CLINICS).map(([slug, clinic]) => (
              <ClinicCard
                key={slug}
                slug={slug}
                name={clinic.name}
                location={clinic.location}
                img={clinic.img}
                description={clinic.intro}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="inline-block rounded-sm bg-primary/10 px-4 py-2 text-[0.82rem] font-medium text-primary">
              Get complete list of leading hospitals
            </span>
          </div>
        </section>

        {/* Reputation section */}
        <section className="mb-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
            Switzerland is internationally renowned for its high quality medical
            infrastructure
          </h2>
          <div className="space-y-4 text-[0.88rem] leading-relaxed text-muted-foreground">
            <p>
              Switzerland is known worldwide for its exceptional healthcare
              system, combining cutting-edge medical technology with
              highly trained specialists and luxurious patient care. Swiss
              hospitals and clinics consistently rank among the best in the
              world, attracting patients from across the globe seeking
              premium medical treatment.
            </p>
            <p>
              From comprehensive health check-ups to specialized surgical
              procedures, Swiss medical institutions offer the highest
              standards of care in a discreet and comfortable environment.
              Many clinics provide multilingual staff and personalized
              concierge services to ensure international patients feel at
              home throughout their treatment journey.
            </p>
          </div>
        </section>

        {/* Articles */}
        <div className="grid gap-5 md:grid-cols-3">
          <Link
            href="#"
            className="group block overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50 hover:bg-card-hover"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-4">
              <h3 className="mb-1 text-[0.9rem] font-semibold text-foreground group-hover:text-primary">
                Your Weight Loss Blueprint
              </h3>
              <span className="inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-[0.75rem] text-primary">
                View
              </span>
            </div>
          </Link>

          <Link
            href="#"
            className="group block overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50 hover:bg-card-hover"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-4">
              <h3 className="mb-1 text-[0.9rem] font-semibold text-foreground group-hover:text-primary">
                How To Lose Weight &amp; Keep It Off
              </h3>
              <span className="inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-[0.75rem] text-primary">
                View
              </span>
            </div>
          </Link>

          <Link
            href="#"
            className="group block overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50 hover:bg-card-hover"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-4">
              <h3 className="mb-1 text-[0.9rem] font-semibold text-foreground group-hover:text-primary">
                Understanding the Weight Loss Journey
              </h3>
              <span className="inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-[0.75rem] text-primary">
                View
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

function ClinicCard({
  slug,
  name,
  location,
  img,
  description,
}: {
  slug: string;
  name: string;
  location: string;
  img: string;
  description: string;
}) {
  return (
    <Link
      href={`/clinics/${slug}`}
      className="group block overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={`${name} facility`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-[0.95rem] font-semibold text-foreground group-hover:text-primary">
          {name}
        </h3>
        <p className="mb-1 text-[0.75rem] font-medium text-primary">{location}</p>
        <p className="line-clamp-3 text-[0.82rem] text-muted-foreground">{description}</p>
        <span className="mt-3 inline-block text-[0.75rem] font-medium text-primary">
          View profile →
        </span>
      </div>
    </Link>
  );
}
