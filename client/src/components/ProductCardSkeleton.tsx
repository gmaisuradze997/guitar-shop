export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden border-3 border-ink bg-white shadow-[4px_4px_0px_0px_#0A0A0A]">
      {/* Image placeholder */}
      <div className="aspect-square border-b-3 border-ink bg-cream-dark animate-pulse" />

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="h-4 w-16 border-2 border-ink/20 bg-cream-dark animate-pulse" />
        <div className="mt-2 h-4 w-full bg-cream-dark animate-pulse" />
        <div className="mt-1 h-4 w-2/3 bg-cream-dark animate-pulse" />
        <div className="mt-2 h-3 w-20 bg-cream-dark animate-pulse" />
        <div className="mt-auto pt-3 border-t-2 border-ink/10 mt-3">
          <div className="h-6 w-20 bg-cream-dark animate-pulse" />
        </div>
      </div>
    </div>
  );
}
