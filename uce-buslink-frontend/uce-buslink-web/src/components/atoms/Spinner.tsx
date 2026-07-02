export function Spinner() {
  return (
    <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
  );
}

export function RouteCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-100 rounded-lg w-full" />
    </div>
  );
}
