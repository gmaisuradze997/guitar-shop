import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <SEO title="Page Not Found" noIndex />
      <h1
        className="glitch-text font-display text-8xl font-bold uppercase text-ink sm:text-9xl"
        data-text="404"
      >
        404
      </h1>
      <p className="mt-4 font-display text-lg font-semibold uppercase text-ink/60">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        to="/"
        className="brutal-btn mt-8 bg-primary-500 text-cream px-8 py-3 text-sm"
      >
        Go Home
      </Link>
    </div>
  );
}
