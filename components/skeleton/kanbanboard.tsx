export default function KanbanSkeleton() {
  return (
    <div className="h-full bg-[#f9f9f9] flex justify-center">
      <div className="flex gap-8 w-fit p-6">

        {[1, 2, 3].map((col) => (
          <div key={col} className="w-[480px] flex flex-col gap-4">

            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />

            <div className="bg-[#f3f3f3] p-4 rounded-xl flex flex-col gap-4">
              {[1, 2, 3].map((card) => (
                <div key={card} className="bg-white p-4 rounded-xl animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}