// React port of public/js/layout.js's renderBreadcrumb(items). Same trail
// logic: last item (or any item without an href) renders as plain text,
// earlier items with an href render as links, separated by "›". JSX handles
// escaping for both text content and the href attribute, so no
// escapeHtml()/escapeAttr() port is needed.
//
// The disabled "Search HospoGrad" input that used to sit here was removed:
// a control styled as live but permanently disabled is worse than no
// control at all (returning users had no way to check for an existing
// thread before posting a duplicate). Reinstate it once search exists.

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-border bg-background px-5 py-2 text-[0.82rem] text-muted-foreground",
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`}>
            {i > 0 ? <span className="mx-1">&rsaquo;</span> : null}
            {isLast || !item.href ? (
              <span className="font-semibold text-foreground">{item.label}</span>
            ) : (
              <a href={item.href} className="text-link hover:underline">
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}
