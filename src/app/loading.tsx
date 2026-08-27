import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
    </div>
  );
}
