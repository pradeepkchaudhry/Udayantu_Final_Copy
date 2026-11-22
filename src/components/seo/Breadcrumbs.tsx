import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight
                  className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {idx === 0 && (
                    <Home className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
