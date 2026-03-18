export default function CategoriesLoading() {
  return (
    <div className="container mx-auto py-24 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <div className="mt-4 md:mt-0 w-full md:w-64">
          <div className="h-10 bg-muted rounded-full w-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="w-full aspect-[3/2] bg-muted border-4 border-white shadow-sm mb-4"></div>
            <div className="h-6 bg-muted rounded-md w-3/4 mx-auto mb-2"></div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-muted"></div>
              <div className="h-4 bg-muted rounded-md w-8"></div>
              <div className="flex-1 h-px bg-muted"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}