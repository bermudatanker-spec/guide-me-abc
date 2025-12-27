// app/[lang]/islands/[island]/[category]/loading.tsx

export default function LoadingCategory() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center text-muted-foreground">
      <div className="mb-4 h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm">Loading category details…</p>
    </div>
  );
}