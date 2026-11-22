import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { EDITORIAL_METADATA, EDITORIAL_TEAM } from "@/data/businessTruth";

interface EditorialTrustBarProps {
  lastReviewed?: string;
  compact?: boolean;
}

export const EditorialTrustBar = ({
  lastReviewed = EDITORIAL_METADATA.lastReviewedDate,
  compact = false,
}: EditorialTrustBarProps) => {
  return (
    <aside
      aria-label="Editorial and review transparency"
      className="rounded-xl border border-border bg-muted/40 p-4 md:p-5 text-sm"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex items-start gap-2.5">
          <FileCheck2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Written By
            </p>
            <Link
              to="/about"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {EDITORIAL_TEAM.author.name}
            </Link>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {EDITORIAL_TEAM.author.role}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Reviewed By
            </p>
            <Link
              to="/placement-support"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {EDITORIAL_TEAM.reviewer.name}
            </Link>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {EDITORIAL_TEAM.reviewer.role}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Calendar className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Last Reviewed
            </p>
            <p className="font-semibold text-foreground">{lastReviewed}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updated {EDITORIAL_METADATA.reviewCadence.toLowerCase()} for hiring accuracy
            </p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-3 border-t border-border/70 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p>{EDITORIAL_METADATA.editorialPolicySummary}</p>
        </div>
      )}
    </aside>
  );
};
