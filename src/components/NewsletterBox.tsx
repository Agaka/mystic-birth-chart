import { Button } from "@/components/Button";

export function NewsletterBox() {
  return (
    <div className="border border-gold/18 bg-midnight-light/45 p-6 text-center">
      <h4 className="font-heading text-xl font-semibold text-ivory">
        Notes from the reading room
      </h4>
      <p className="mt-2 text-sm text-ivory/50">
        New essays on astrology, chart synthesis, and symbolic self-study.
      </p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        action="#"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 border border-ivory/15 bg-ink px-4 py-2.5 font-ui text-sm text-ivory placeholder:text-ivory/30 transition-colors focus:border-gold/40 focus:outline-none"
          aria-label="Email address"
        />
        <Button type="submit" size="sm">
          Subscribe
        </Button>
      </form>
      <p className="mt-3 text-xs text-ivory/25">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
