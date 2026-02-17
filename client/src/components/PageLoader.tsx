export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <div className="inline-flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-4 w-4 border-3 border-ink bg-primary-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="mt-4 font-mono text-sm font-bold uppercase tracking-widest text-ink/50">
          Loading...
        </p>
      </div>
    </div>
  );
}
