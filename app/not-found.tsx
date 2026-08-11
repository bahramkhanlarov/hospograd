import Link from "next/link";
import { Nav } from "@/components/layout/nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <h1 className="mb-2 font-display text-[3rem] font-normal text-muted-foreground">404</h1>
        <p className="mb-6 text-[0.9rem] text-muted-foreground">
          Page not found.
        </p>
        <Link href="/" className="rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground hover:bg-primary-hover">
          Back to home
        </Link>
      </div>
    </>
  );
}