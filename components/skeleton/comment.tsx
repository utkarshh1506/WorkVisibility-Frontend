export function CommentSkeleton() {
  return (
    <div className="flex flex-col gap-3 mt-2">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse border-l pl-3">
          <div className="bg-gray-200 h-3 w-24 rounded mb-1" />
          <div className="bg-gray-200 h-3 w-3/4 rounded" />
        </div>
      ))}
    </div>
  );
}