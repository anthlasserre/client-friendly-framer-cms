import { Skeleton } from "./ui/skeleton";

export function CollectionsShellSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row">
      <header className="md:hidden flex items-center justify-between gap-2 border-b border-(--color-border) px-3 py-2 shrink-0">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-4 w-32" />
        <div className="w-9" />
      </header>
      <aside className="hidden md:flex w-64 shrink-0 border-r border-(--color-border) bg-(--color-muted) h-full flex-col p-4 gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40 opacity-70" />
        <div className="h-2" />
        <Skeleton className="h-3 w-20" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full" />
        ))}
      </aside>
      <main className="flex-1 overflow-auto">
        <ItemsTableSkeleton />
      </main>
    </div>
  );
}

export function ItemsTableSkeleton() {
  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-32" />
      </header>
      <ul className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-lg border border-(--color-border) bg-(--color-background) p-3"
          >
            <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ItemFormSkeleton() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl space-y-6">
      <Skeleton className="h-7 w-20" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
