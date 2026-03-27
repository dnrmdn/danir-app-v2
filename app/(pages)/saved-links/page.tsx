"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, FolderKanban, Grid3X3, Link2, Plus, Search, Sparkles, Tag, TableProperties } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/useUserSession";
import { useLanguage } from "@/components/language-provider";
import AddLinkModal from "@/components/saved-links/add-link-modal";
import { contentSavedLinksLocal } from "./_constants";
import { FilterType, SavedLink } from "./_types";
import { SummaryCard } from "./_components/summaryLinksCard";
import { LinkCard } from "./_components/linkCard";
import { ListRow } from "./_components/listRow";
import { ViewModeToggle } from "@/components/partner/view-mode-toggle";
import { usePartnerStore } from "@/lib/store/partner-store";
import { usePlanAccess } from "@/hooks/usePlanAccess";

export default function SavedLinksPage() {
  const { session } = useUserSession();
  const { locale } = useLanguage();
  const t = contentSavedLinksLocal[locale];
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setLayoutViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const { plan, reload: reloadPlan } = usePlanAccess();

  const { viewMode: partnerViewMode, setViewMode, fetchConnection, fetchFeatureAccess, getActiveConnectionId, isFeatureShared } = usePartnerStore();

  // Fetch partner data on mount
  useEffect(() => {
    fetchConnection().then(() => fetchFeatureAccess());
  }, [fetchConnection, fetchFeatureAccess]);

  const fetchLinks = async () => {
    try {
      const connectionId = getActiveConnectionId();
      const isShared = isFeatureShared("LINKS");
      let url = "/api/links";
      if (isShared && partnerViewMode === "shared" && connectionId) {
        url += `?view=shared&connectionId=${connectionId}`;
      } else {
        url += "?view=personal";
      }
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      setLoading(true);
      void fetchLinks();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, partnerViewMode]);

  useEffect(() => {
    if (!plan?.hasSharedFeatures && partnerViewMode === "shared") {
      setViewMode("personal");
    }
  }, [partnerViewMode, plan?.hasSharedFeatures, setViewMode]);

  const allLabels = useMemo(() => {
    const raw = links.flatMap((link) => (link.label ? link.label.split(",").map((item) => item.trim()) : []));
    return Array.from(new Set(raw)).filter(Boolean);
  }, [links]);

  const topDomains = useMemo(() => {
    const counts = new Map<string, number>();
    links.forEach((link) => {
      try {
        const domain = new URL(link.url).hostname.replace(/^www\./, "");
        counts.set(domain, (counts.get(domain) ?? 0) + 1);
      } catch {
        // ignore bad url parsing
      }
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [links]);

  const filteredLinks = useMemo(() => {
    const query = search.toLowerCase().trim();

    return links.filter((link) => {
      const matchesSearch = !query || link.title.toLowerCase().includes(query) || link.url.toLowerCase().includes(query) || (link.label || "").toLowerCase().includes(query);

      const hasLabel = !!link.label?.trim();
      const matchesFilter = filter === "all" ? true : filter === "labeled" ? hasLabel : filter === "unlabeled" ? !hasLabel : true;

      return matchesSearch && matchesFilter;
    });
  }, [links, search, filter]);

  const visibleLinks = useMemo(() => filteredLinks.slice(0, visibleCount), [filteredLinks, visibleCount]);

  useEffect(() => {
    setVisibleCount(24);
  }, [search, filter]);

  const recentCount = links.length;
  const linkLimitReached = Boolean(plan && plan.savedLinksLimit !== null && plan.savedLinksCount >= plan.savedLinksLimit);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const filterOptions: Array<[FilterType, string]> = [
    ["all", t.filterAll],
    ["labeled", t.filterLabeled],
    ["unlabeled", t.filterUnlabeled],
    ["recent", t.filterRecent],
  ];

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="rounded-4xl border border-border bg-card p-8 text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <Link2 className="text-cyan-600 dark:text-cyan-200" />
            <h1 className="text-3xl font-black">{t.pageTitle}</h1>
          </div>
          <p className="mb-6 text-muted-foreground dark:text-slate-300">{t.loginRequired}</p>
          <Button asChild className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 font-semibold text-cyan-700 hover:bg-cyan-400/15 dark:text-cyan-100">
            <a href="/login">{t.login}</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-24 sm:pb-28 relative">
        <section className="rounded-4xl border border-border bg-card p-6 text-foreground shadow-2xl shadow-cyan-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                {t.heroTag}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground dark:text-white sm:text-5xl">{t.heroTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground dark:text-slate-300 sm:text-base">{t.heroDesc}</p>
            </div>
            <div className="flex items-center gap-3">
              <ViewModeToggle feature="LINKS" locale={locale} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-1.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title={t.totalLinks} value={String(links.length)} subtitle={t.totalLinksDesc} icon={<Link2 className="h-3 w-3 text-cyan-600 dark:text-cyan-200 sm:h-5 sm:w-5" />} />
          <SummaryCard title={t.labelsUsed} value={String(allLabels.length)} subtitle={t.labelsUsedDesc} icon={<Tag className="h-3 w-3 text-violet-600 dark:text-violet-200 sm:h-5 sm:w-5" />} />
          <SummaryCard title={t.recentSaves} value={String(recentCount)} subtitle={t.recentSavesDesc} icon={<Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-200 sm:h-5 sm:w-5" />} />
          <SummaryCard
            title={t.topSource}
            value={topDomains[0]?.[0] || "—"}
            subtitle={topDomains[0] ? `${topDomains[0][1]} ${t.topSourceDesc}` : t.noTopSource}
            icon={<FolderKanban className="h-3 w-3 text-amber-600 dark:text-amber-200 sm:h-5 sm:w-5" />}
          />
        </section>

        {plan && (
          <Card className="max-w-none! rounded-4xl border border-border bg-card p-5 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-black">{plan.label}</div>
                <div className="text-sm text-muted-foreground dark:text-slate-400">
                  {plan.savedLinksLimit === null
                    ? locale === "id"
                      ? "Saved links tidak dibatasi dengan akses penuh."
                      : "Unlimited saved links with full access."
                    : locale === "id"
                      ? `${plan.savedLinksCount}/${plan.savedLinksLimit} saved links terpakai di paket Free.`
                      : `${plan.savedLinksCount}/${plan.savedLinksLimit} saved links used on Free plan.`}
                </div>
              </div>
              {plan.isTrialActive && (
                <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-100">
                  {locale === "id"
                    ? `Sisa ${plan.trialDaysRemaining} hari Pro Trial`
                    : `${plan.trialDaysRemaining} day${plan.trialDaysRemaining === 1 ? "" : "s"} left in Pro Trial`}
                </div>
              )}
            </div>
          </Card>
        )}

        {linkLimitReached && (
          <Card className="max-w-none! rounded-4xl border border-amber-300/20 bg-amber-400/10 p-5 text-amber-900 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-100">
            <div className="text-lg font-black">
              {locale === "id" ? "Batas link paket Free sudah tercapai" : "Free plan link limit reached"}
            </div>
            <div className="mt-1 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">
              {locale === "id"
                ? "Link lama tetap bisa dilihat, diedit, dan dihapus, tetapi menambah link baru membutuhkan Pro."
                : "You can still view, edit, and delete your existing links, but adding a new one needs Pro."}
            </div>
          </Card>
        )}

        <Card className="max-w-none! rounded-4xl border border-border bg-card p-5 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-12 rounded-2xl border-border bg-muted/50 pl-11 text-foreground placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/80 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filterOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${filter === value ? "bg-cyan-400/15 text-cyan-700 ring-1 ring-cyan-300/20 dark:text-cyan-100" : "bg-muted/50 text-muted-foreground hover:bg-muted dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"}`}
                >
                  {label}
                </button>
              ))}

              <div className="ml-1 flex items-center gap-2 rounded-full border border-border bg-muted/50 p-1 dark:border-white/10 dark:bg-[#07111f]/80">
                <button
                  type="button"
                  onClick={() => setLayoutViewMode("grid")}
                  className={`rounded-full p-2 transition ${viewMode === "grid" ? "bg-foreground text-background dark:bg-white dark:text-slate-950" : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white"}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutViewMode("list")}
                  className={`rounded-full p-2 transition ${viewMode === "list" ? "bg-foreground text-background dark:bg-white dark:text-slate-950" : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white"}`}
                >
                  <TableProperties size={16} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="max-w-none! rounded-4xl border border-border bg-card p-5 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={16} className="text-violet-600 dark:text-violet-200" />
            <div>
              <div className="text-lg font-black">{t.topLabels}</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">{t.topLabelsDesc}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allLabels.length > 0 ? (
              allLabels.slice(0, 12).map((label) => (
                <span key={label} className="rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-700 dark:text-violet-100">
                  {label}
                </span>
              ))
            ) : (
              <div className="text-sm text-muted-foreground dark:text-slate-400">{t.noLabels}</div>
            )}
          </div>
        </Card>

        <Card className="max-w-none! rounded-4xl border border-border bg-card p-5 text-foreground backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-black">{t.allSavedLinks}</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">{t.allSavedLinksDesc}</div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-2xl bg-muted/50 dark:bg-white/5" />
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-[#07111f]/50 dark:text-slate-400">{t.noResults}</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2 xl:grid-cols-8">
              {visibleLinks.map((link) => (
                <LinkCard key={link.id} link={link} onCopy={copyLink} noLabelText={t.noLabel} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleLinks.map((link) => (
                <ListRow key={link.id} link={link} onCopy={copyLink} noLabelText={t.noLabelList} />
              ))}
            </div>
          )}

          {filteredLinks.length > visibleCount && (
            <div className="mt-4 flex justify-center sm:mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-400/15 dark:text-cyan-100 sm:px-5 sm:text-sm"
              >
                {t.seeMore}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* FAB - Add Link Button */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-90 flex flex-col items-end gap-3">
        <Button
          size="icon"
          disabled={linkLimitReached}
          className="h-14 w-14 rounded-full shadow-2xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all duration-300 active:scale-90 disabled:bg-slate-400 disabled:hover:bg-slate-400 dark:disabled:bg-slate-700"
          onClick={() => setShowAddModal(true)}
          title={linkLimitReached ? (locale === "id" ? "Upgrade ke Pro untuk menambah link" : "Upgrade to Pro to add more links") : t.addNewLink}
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>

      <AddLinkModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        connectionId={partnerViewMode === "shared" && isFeatureShared("LINKS") ? getActiveConnectionId() : null}
        onCreated={(createdLink) => {
          setLinks((prev) => {
            const withoutDuplicate = prev.filter((link) => link.id !== createdLink.id);
            return [createdLink, ...withoutDuplicate];
          });
          setLoading(true);
          void reloadPlan();
          void fetchLinks();
        }}
      />
    </>
  );
}
