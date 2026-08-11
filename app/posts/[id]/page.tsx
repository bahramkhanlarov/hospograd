// Next.js port of the vanilla post page (public/post.html + public/js/post.js).
// Server component reads params.id and composes the layout shell;
// the interactive client sub-component handles data fetching and rendering.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PostDetail } from "./post-detail";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Post" }]} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-4">
        <Suspense
          fallback={
            <p className="py-12 text-center italic text-muted-foreground">
              Loading…
            </p>
          }
        >
          <PostDetail id={id} />
        </Suspense>
      </div>
    </>
  );
}