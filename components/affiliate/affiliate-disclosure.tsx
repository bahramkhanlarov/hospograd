// Affiliate disclosure, required on any page that renders affiliate links
// (the /tools page and finance-guide callouts). Keeps us FTC/GEO-clean and
// consistent with the site's independent, student-run positioning.

export function AffiliateDisclosure() {
  return (
    <p className="rounded-md border border-border bg-secondary px-4 py-3 text-[0.75rem] leading-relaxed text-muted-foreground">
      Disclosure: some links on this page are affiliate links. If you sign up
      through them, we may earn a small commission at no extra cost to you.
      HospoGrad is an independent, student-run community and is not affiliated
      with or endorsed by these companies.
    </p>
  );
}