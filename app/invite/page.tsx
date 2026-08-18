import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ShareCta } from "@/components/share/share-cta";
import { FINANCE_GUIDES } from "@/lib/finance-guides";

// Invite loop landing page. No referral tracking yet — the loop is simply:
// share a pre-written message about the community, friends land on the
// guides, some sign up. The guide list below doubles as the "here's what
// they'd get" pitch and as indexable internal links.

export const dynamic = "force-dynamic";

const SITE = "https://hospograd-web.bahram-khanlarov.workers.dev";

const INVITE_TITLE = "Invite your classmates to HospoGrad";
const INVITE_TEXT =
  "HospoGrad is a free community for Swiss hotel-school students and grads — guides on first salaries, taxes, health insurance and banking, plus a real forum. Worth a look:";

export const metadata = {
  title: `${INVITE_TITLE} | HospoGrad`,
  description:
    "Know a hospitality student or graduate starting out in Switzerland? Share HospoGrad's free guides on salaries, taxes, insurance and banking — no signup needed to read them.",
};

export default function InvitePage() {
  const guides = Object.entries(FINANCE_GUIDES);

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Invite" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-foreground">
          {INVITE_TITLE}
        </h1>
        <p className="mb-6 max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
          If Swiss money questions helped you, chances are they&rsquo;re
          helping your classmates too. Pick a channel, send the pre-written
          message, and let the guides do the rest — reading needs no account.
        </p>

        <div className="mb-10 rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="font-display mb-1.5 text-[1.05rem] font-medium text-foreground">
            Share HospoGrad
          </h2>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            Sends the site home page, plus the quickest useful links below.
          </p>
          <ShareCta
            title={INVITE_TITLE}
            text={INVITE_TEXT}
            url={SITE}
          />
        </div>

        <section>
          <h2 className="font-display mb-4 text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            The guides they&rsquo;ll land on
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {guides.map(([slug, guide]) => (
              <a
                key={slug}
                href={`/finance/${slug}`}
                className="rounded-sm border border-border px-3 py-2 text-[0.82rem] text-link transition-colors hover:border-primary/50 hover:bg-card-hover"
              >
                {guide.name} &rarr;
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}