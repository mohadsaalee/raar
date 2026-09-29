import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-32 text-center">
      <p className="font-display text-8xl text-neutral-300">404</p>
      <h1 className="font-display text-3xl uppercase">Page not found</h1>
      <Link href="/" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Back to home</Link>
    </div>
  );
}
