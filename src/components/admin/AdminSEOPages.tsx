import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ALL_PUBLIC_SEO_ROUTES, generateSitemapXml } from "@/data/seoRoutes";
import { EDITORIAL_METADATA, EDITORIAL_TEAM } from "@/data/businessTruth";
import { getCanonicalUrl } from "@/utils/seo";

export interface ManagedSeoPage {
  id: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  introSummary: string;
  authorName: string;
  reviewerName: string;
  lastReviewedDate: string;
  indexable: boolean;
  published: boolean;
  source: "built-in" | "custom";
}

const STORAGE_KEY = "udayantu_admin_seo_pages_v1";

function buildDefaultRecords(): ManagedSeoPage[] {
  return ALL_PUBLIC_SEO_ROUTES.map((route, idx) => ({
    id: `builtin-${idx + 1}`,
    slug: route.path,
    seoTitle: route.seoTitle,
    metaDescription: route.metaDescription,
    h1: route.h1,
    primaryKeyword: route.primaryKeyword,
    secondaryKeywords: route.secondaryKeywords.join(", "),
    introSummary: route.purpose,
    authorName: EDITORIAL_TEAM.author.name,
    reviewerName: EDITORIAL_TEAM.reviewer.name,
    lastReviewedDate: EDITORIAL_METADATA.lastReviewedDate,
    indexable: route.indexable,
    published: true,
    source: "built-in",
  }));
}

export function validateSeoPageDraft(
  draft: ManagedSeoPage,
  existingPages: ManagedSeoPage[]
): string[] {
  const errors: string[] = [];
  const normalizedSlug = draft.slug.trim().replace(/\/+$/, "") || "/";

  if (!normalizedSlug.startsWith("/")) {
    errors.push("URL slug must start with '/' (for example: /jobs-after-btech).");
  }

  const duplicate = existingPages.find(
    (p) =>
      p.id !== draft.id &&
      ((p.slug.trim().replace(/\/+$/, "") || "/") === normalizedSlug)
  );
  if (duplicate) {
    errors.push(`Duplicate slug detected: "${normalizedSlug}" already exists.`);
  }

  if (draft.published) {
    if (draft.seoTitle.trim().length < 20) {
      errors.push("Published pages require an SEO title of at least 20 characters.");
    }
    if (draft.metaDescription.trim().length < 60) {
      errors.push("Published pages require a meta description of at least 60 characters.");
    }
    if (draft.h1.trim().length < 10) {
      errors.push("Published pages require an H1 heading of at least 10 characters.");
    }
    if (draft.introSummary.trim().length < 20) {
      errors.push("Published pages require an editorial summary/intro before publishing.");
    }
  }

  return errors;
}

export function AdminSEOPages() {
  const { toast } = useToast();
  const [pages, setPages] = useState<ManagedSeoPage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ManagedSeoPage | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ManagedSeoPage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed);
          setSelectedId(parsed[0].id);
          setDraft(parsed[0]);
          return;
        }
      }
    } catch {
      // Fallback to defaults
    }
    const defaults = buildDefaultRecords();
    setPages(defaults);
    setSelectedId(defaults[0]?.id ?? null);
    setDraft(defaults[0] ?? null);
  }, []);

  const persistPages = (next: ManagedSeoPage[]) => {
    setPages(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Non-blocking storage fallback
    }
  };

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.slug.toLowerCase().includes(q) ||
        p.seoTitle.toLowerCase().includes(q) ||
        p.primaryKeyword.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  const handleSelectPage = (page: ManagedSeoPage) => {
    setSelectedId(page.id);
    setDraft({ ...page });
    setValidationErrors([]);
  };

  const handleCreateNew = () => {
    const newItem: ManagedSeoPage = {
      id: `custom-${Date.now()}`,
      slug: "/new-career-guide",
      seoTitle: "",
      metaDescription: "",
      h1: "",
      primaryKeyword: "",
      secondaryKeywords: "",
      introSummary: "",
      authorName: EDITORIAL_TEAM.author.name,
      reviewerName: EDITORIAL_TEAM.reviewer.name,
      lastReviewedDate: new Date().toISOString().slice(0, 10),
      indexable: true,
      published: false,
      source: "custom",
    };
    setSelectedId(newItem.id);
    setDraft(newItem);
    setValidationErrors([]);
  };

  const handleSave = () => {
    if (!draft) return;
    const errors = validateSeoPageDraft(draft, pages);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast({
        title: "SEO Validation Failed",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    const normalizedDraft: ManagedSeoPage = {
      ...draft,
      slug: draft.slug.trim() === "/" ? "/" : draft.slug.trim().replace(/\/+$/, ""),
    };

    const exists = pages.some((p) => p.id === normalizedDraft.id);
    const next = exists
      ? pages.map((p) => (p.id === normalizedDraft.id ? normalizedDraft : p))
      : [normalizedDraft, ...pages];

    persistPages(next);
    setDraft(normalizedDraft);
    setValidationErrors([]);
    toast({
      title: "SEO Page Metadata Saved",
      description: `Saved ${normalizedDraft.slug} (${normalizedDraft.published ? "Published" : "Draft"})`,
    });
  };

  const handleDeleteCustom = (id: string) => {
    const target = pages.find((p) => p.id === id);
    if (!target || target.source === "built-in") return;
    const next = pages.filter((p) => p.id !== id);
    persistPages(next);
    setSelectedId(next[0]?.id ?? null);
    setDraft(next[0] ?? null);
    toast({ title: "Custom SEO Entry Removed" });
  };

  const handleDownloadSitemap = () => {
    const xml = generateSitemapXml(new Date().toISOString().slice(0, 10));
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Sitemap Exported",
      description: `Generated sitemap.xml with ${ALL_PUBLIC_SEO_ROUTES.length} canonical URLs.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E3A63] flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#FF5A1F]" />
            SEO Pages & Metadata Manager
          </h2>
          <p className="text-sm text-slate-600">
            Manage canonical routes, SEO titles, meta descriptions, review dates, and indexation guardrails.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadSitemap}>
            Export Sitemap XML
          </Button>
          <Button
            size="sm"
            onClick={handleCreateNew}
            className="bg-[#FF5A1F] hover:bg-[#e04f1a] text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New SEO Entry
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Route List */}
        <Card className="lg:col-span-5 border border-slate-200 rounded-2xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Public SEO Inventory ({pages.length} Routes)
            </CardTitle>
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by URL slug or keyword..."
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[540px] overflow-y-auto space-y-2 pr-2">
            {filteredPages.map((page) => {
              const active = selectedId === page.id;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => handleSelectPage(page)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    active
                      ? "border-[#FF5A1F] bg-orange-50/60"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-[#1E3A63] truncate">
                      {page.slug}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge
                        variant={page.published ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {page.published ? "Published" : "Draft"}
                      </Badge>
                      {!page.indexable && (
                        <Badge variant="destructive" className="text-[10px]">
                          noindex
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 font-medium line-clamp-1">
                    {page.seoTitle || "(Untitled draft)"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    KW: {page.primaryKeyword || "—"}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-7 border border-slate-200 rounded-2xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {draft ? `Editing: ${draft.slug}` : "Select a page to edit"}
            </CardTitle>
            <CardDescription>
              Validation prevents duplicate URL slugs and blocks publishing incomplete metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft ? (
              <>
                {validationErrors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1 text-xs text-red-700">
                    {validationErrors.map((err) => (
                      <p key={err} className="flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="seo-slug">URL Slug</Label>
                    <Input
                      id="seo-slug"
                      value={draft.slug}
                      disabled={draft.source === "built-in"}
                      onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    />
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      Canonical: {getCanonicalUrl(draft.slug)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="seo-keyword">Primary Target Keyword</Label>
                    <Input
                      id="seo-keyword"
                      value={draft.primaryKeyword}
                      onChange={(e) =>
                        setDraft({ ...draft, primaryKeyword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-title">SEO Title Tag</Label>
                    <span className="text-[11px] text-slate-500">
                      {draft.seoTitle.length} chars (ideal: 50–65)
                    </span>
                  </div>
                  <Input
                    id="seo-title"
                    value={draft.seoTitle}
                    onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-desc">Meta Description</Label>
                    <span className="text-[11px] text-slate-500">
                      {draft.metaDescription.length} chars (ideal: 120–160)
                    </span>
                  </div>
                  <Textarea
                    id="seo-desc"
                    rows={3}
                    value={draft.metaDescription}
                    onChange={(e) =>
                      setDraft({ ...draft, metaDescription: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seo-h1">H1 Heading</Label>
                  <Input
                    id="seo-h1"
                    value={draft.h1}
                    onChange={(e) => setDraft({ ...draft, h1: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seo-summary">Editorial Summary / Purpose</Label>
                  <Textarea
                    id="seo-summary"
                    rows={2}
                    value={draft.introSummary}
                    onChange={(e) =>
                      setDraft({ ...draft, introSummary: e.target.value })
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="seo-author">Author</Label>
                    <Input
                      id="seo-author"
                      value={draft.authorName}
                      onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="seo-reviewer">Reviewer</Label>
                    <Input
                      id="seo-reviewer"
                      value={draft.reviewerName}
                      onChange={(e) =>
                        setDraft({ ...draft, reviewerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="seo-date">Last Reviewed</Label>
                    <Input
                      id="seo-date"
                      type="date"
                      value={draft.lastReviewedDate}
                      onChange={(e) =>
                        setDraft({ ...draft, lastReviewedDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="seo-indexable"
                      checked={draft.indexable}
                      onCheckedChange={(checked) =>
                        setDraft({ ...draft, indexable: checked })
                      }
                    />
                    <Label htmlFor="seo-indexable" className="text-xs">
                      Indexable (allow Google indexing)
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="seo-published"
                      checked={draft.published}
                      onCheckedChange={(checked) =>
                        setDraft({ ...draft, published: checked })
                      }
                    />
                    <Label htmlFor="seo-published" className="text-xs">
                      Published
                    </Label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={draft.slug}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A63] hover:underline"
                    >
                      Open Live Route
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {draft.source === "custom" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCustom(draft.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete Draft
                      </Button>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleSave}
                    className="bg-[#1E3A63] hover:bg-[#1E3A63]/90 text-white"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save SEO Metadata
                  </Button>
                </div>

                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3 flex items-start gap-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Sitemap & canonical checks automatically align with{" "}
                    <strong>https://udayantu.com</strong> and exclude private student, employer, and admin routes.
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select an SEO entry from the left list.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
