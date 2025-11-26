// app/islands/[island]/loading.tsx
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center text-muted-foreground">
      <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p>Loading island content...</p>
    </div>
  );
}