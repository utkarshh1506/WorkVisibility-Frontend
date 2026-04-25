export default function NavbarProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      
      {/* Avatar */}
      <div className="w-8 h-8 bg-gray-300 rounded-full" />

      {/* Name */}
      <div className="h-3 w-20 bg-gray-300 rounded" />
    </div>
  );
}