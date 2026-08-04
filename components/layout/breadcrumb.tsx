// React port of public/js/layout.js's renderBreadcrumb(items). Same trail
// logic: last item (or any item without an href) renders as plain text,
// earlier items with an href render as links, separated by "›". JSX handles
// escaping for both text content and the href attribute, so no
// escapeHtml()/escapeAttr() port is needed.

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
        "flex items-center justify-between border-b border-border bg-card px-5 py-2 text-[0.82rem]",
        className,
      )}
    >
      <div className="text-muted-foreground">
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
      <input
        className="w-[220px] rounded-sm border border-border bg-card px-[0.6rem] py-[0.3rem] text-[0.82rem] text-muted-foreground"
        type="text"
        placeholder="Search HospoGrad"
        disabled
      />
    </div>
  );
}
