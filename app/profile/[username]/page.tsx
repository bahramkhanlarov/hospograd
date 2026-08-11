// Next.js port of public/profile.html + public/js/profile.js.
// Server component reads params.username, renders shared layout (Nav,
// Breadcrumb) and delegates data-fetching to a client sub-component.

import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProfileContent } from "./profile-content";

// API data is fetched client-side — no static prerendering needed.
export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: `u/${username}` },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-4">
        <ProfileContent username={username} />
      </div>
    </>
  );
}