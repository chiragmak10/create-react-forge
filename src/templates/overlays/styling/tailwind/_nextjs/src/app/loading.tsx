export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

