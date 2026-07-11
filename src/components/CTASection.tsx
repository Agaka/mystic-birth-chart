import { Button } from "@/components/Button";

interface CTASectionProps {
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  variant?: "dark" | "gradient" | "subtle";
  analyticsLocation?: string;
}

export function CTASection({
  title,
  body,
  buttonLabel,
  buttonHref,
  variant = "dark",
  analyticsLocation = "cta_section",
}: CTASectionProps) {
  const bgStyles = {
    dark: "bg-ink",
    gradient: "wood-panel",
    subtle: "bg-midnight-light/50",
  };

  return (
    <section className={`relative py-20 md:py-28 ${bgStyles[variant]}`}>
      <div className="gold-divider mb-16" />

      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-heading text-3xl font-medium text-ivory md:text-4xl">
          {title}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ivory/62">{body}</p>
        <div className="mt-10">
          <Button
            href={buttonHref}
            size="lg"
            analytics={{
              event: "cta_click",
              params: {
                cta_location: analyticsLocation,
              },
            }}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>

      <div className="gold-divider mt-16" />
    </section>
  );
}
