"use client";

import Image from "next/image";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1280 },
    items: 3,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1280, min: 768 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 768, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

const partners = [
  {
    shortName: "NSIA",
    organizationName: "NSIA Insurance",
    subtitle: "Nouvelle Societe Interafricaine d'Assurance",
    description:
      "A pan-African composite insurer providing life and non-life cover that strengthens confidence in the scheme.",
    logoSrc: "/partners/nsia-insurance.png",
    logoWidth: 240,
    logoHeight: 88,
    badgeClassName: "bg-sky-100 text-sky-700",
  },
  {
    shortName: "CHI",
    organizationName: "Consolidated Hallmark Insurance Plc",
    subtitle: "Part of Consolidated Hallmark Holdings",
    description:
      "A leading underwriter for general business and special risks, bringing underwriting depth to builders' liability coverage.",
    logoSrc: "/partners/consolidated-hallmark.png",
    logoWidth: 240,
    logoHeight: 88,
    badgeClassName: "bg-amber-100 text-amber-800",
  },
  {
    shortName: "NIA",
    organizationName: "Nigerian Insurers Association",
    subtitle: "Umbrella body for registered insurers and reinsurers",
    description:
      "The industry's trade association helping align standards, collaboration, and trust across participating insurers.",
    logoSrc: "/partners/nia.png",
    logoWidth: 240,
    logoHeight: 88,
    badgeClassName: "bg-emerald-100 text-emerald-800",
  },
  {
    shortName: "NIIP",
    organizationName: "Nigerian Insurance Industry Portal",
    subtitle: "Digital verification and policy services platform",
    description:
      "A public-facing platform for policy purchase, renewal, and authenticity checks that helps reduce fake certificates.",
    logoSrc: "/partners/niip.jpg",
    logoWidth: 240,
    logoHeight: 88,
    badgeClassName: "bg-indigo-100 text-indigo-800",
  },
];

const PartnersCarousel = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-green-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-40 w-40 rounded-full bg-emerald-100/80 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div data-aos="fade-up" className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-green-700">
            Scheme Partners
          </p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Trusted organizations supporting FCT Builders Liability Insurance
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            The scheme is delivered with insurers, industry bodies, and digital
            infrastructure partners working together to improve compliance,
            protection, and policy verification.
          </p>
        </div>

        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={3500}
          customTransition="transform 700ms ease"
          transitionDuration={700}
          pauseOnHover
          arrows={false}
          showDots={false}
          itemClass="pb-4"
          containerClass="pb-2"
        >
          {partners.map((partner) => (
            <div key={partner.shortName} className="mx-3 h-full">
              <article className="flex h-full min-h-[360px] flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-4">
                  <Image
                    src={partner.logoSrc}
                    alt={`${partner.organizationName} logo`}
                    width={partner.logoWidth}
                    height={partner.logoHeight}
                    className="h-auto max-h-16 w-auto"
                  />
                </div>

                <div className="mt-6 flex flex-1 flex-col">
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${partner.badgeClassName}`}
                  >
                    {partner.shortName}
                  </span>

                  <h3 className="mt-4 text-xl font-semibold leading-snug text-slate-900">
                    {partner.organizationName}
                  </h3>

                  <p className="mt-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                    {partner.subtitle}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {partner.description}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default PartnersCarousel;
