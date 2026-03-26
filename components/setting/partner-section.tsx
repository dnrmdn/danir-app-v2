"use client";

import { useEffect, useState } from "react";
import { Heart, UserPlus, X, Check, Unlink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { usePartnerStore } from "@/lib/store/partner-store";
import { useSession } from "@/lib/auth-client";
import type { PartnerFeatureKey } from "@/types/partner";
import { usePlanAccess } from "@/hooks/usePlanAccess";

const FEATURES: { key: PartnerFeatureKey; label: { id: string; en: string } }[] = [
  { key: "TASKS", label: { id: "Tugas", en: "Tasks" } },
  { key: "MONEY", label: { id: "Keuangan", en: "Money Tracker" } },
  { key: "MEAL", label: { id: "Rencana Makan", en: "Meal Plan" } },
  { key: "LINKS", label: { id: "Link Tersimpan", en: "Saved Links" } },
];

const contentLocal = {
  id: {
    title: "Partner Sharing",
    desc: "Hubungkan akun Anda dengan pasangan untuk berbagi fitur tertentu.",
    inviteLabel: "Undang Partner",
    invitePlaceholder: "Email partner Anda",
    inviteBtn: "Kirim Undangan",
    pendingSent: "Menunggu diterima oleh",
    pendingReceived: "Undangan dari",
    accept: "Terima",
    reject: "Tolak",
    cancel: "Batalkan",
    connectedTo: "Terhubung dengan",
    disconnect: "Putuskan Koneksi",
    featureTitle: "Fitur yang Dibagikan",
    featureDesc: "Aktifkan fitur yang ingin Anda bagikan. Kedua sisi harus mengaktifkan agar berbagi aktif.",
    noPartner: "Belum terhubung dengan partner.",
    you: "(Anda)",
    partner: "(Partner)",
    bothEnabled: "✓ Aktif",
    waitingPartner: "Menunggu partner",
    planLockedTitle: "Partner sharing ada di Pro",
    planLockedDesc: "Akun Free tetap bisa dipakai seperti biasa, tapi fitur berbagi partner hanya tersedia saat Pro Trial atau Pro aktif.",
    planLockedHint: "Upgrade ke Pro untuk membuka shared tasks, money, meal plan, dan saved links.",
    acceptLocked: "Terima undangan dengan Pro",
  },
  en: {
    title: "Partner Sharing",
    desc: "Connect your account with your partner to share specific features.",
    inviteLabel: "Invite Partner",
    invitePlaceholder: "Your partner's email",
    inviteBtn: "Send Invite",
    pendingSent: "Waiting to be accepted by",
    pendingReceived: "Invitation from",
    accept: "Accept",
    reject: "Reject",
    cancel: "Cancel",
    connectedTo: "Connected to",
    disconnect: "Disconnect",
    featureTitle: "Shared Features",
    featureDesc: "Enable the features you want to share. Both sides must enable for sharing to be active.",
    noPartner: "Not connected with a partner yet.",
    you: "(You)",
    partner: "(Partner)",
    bothEnabled: "✓ Active",
    waitingPartner: "Waiting for partner",
    planLockedTitle: "Partner sharing is part of Pro",
    planLockedDesc: "Free accounts can still use the app normally, but partner-sharing features are only available during Pro Trial or Pro.",
    planLockedHint: "Upgrade to Pro to unlock shared tasks, money, meal plans, and saved links.",
    acceptLocked: "Accept with Pro",
  },
} as const;

export function PartnerSection({ locale }: { locale: "id" | "en" }) {
  const t = contentLocal[locale];
  const { data: session } = useSession();
  const { plan } = usePlanAccess();
  const {
    connection,
    featureAccess,
    isLoading,
    fetchConnection,
    sendInvite,
    acceptInvite,
    removeConnection,
    fetchFeatureAccess,
    toggleFeature,
  } = usePartnerStore();

  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const canUseSharedFeatures = plan?.hasSharedFeatures ?? false;

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  useEffect(() => {
    if (connection?.status === "ACCEPTED") {
      fetchFeatureAccess();
    }
  }, [connection, fetchFeatureAccess]);

  const userId = session?.user?.id;
  const isPending = connection?.status === "PENDING";
  const isAccepted = connection?.status === "ACCEPTED";
  const isSender = connection?.userAId === userId;

  const partnerUser = connection
    ? connection.userAId === userId
      ? connection.userB
      : connection.userA
    : null;

  const handleSendInvite = async () => {
    setInviteError(null);
    if (!canUseSharedFeatures) {
      setInviteError(t.planLockedHint);
      return;
    }
    const result = await sendInvite(email.trim());
    if (result.success) {
      setEmail("");
    } else {
      setInviteError(result.error || "Failed to send invite");
    }
  };

  const getMyAccessForFeature = (feature: PartnerFeatureKey) => {
    return featureAccess.find((fa) => fa.feature === feature && fa.userId === userId);
  };

  const getPartnerAccessForFeature = (feature: PartnerFeatureKey) => {
    return featureAccess.find((fa) => fa.feature === feature && fa.userId !== userId);
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/4">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl border border-pink-300/15 bg-pink-400/10 p-3 text-pink-700 dark:text-pink-200">
          <Heart className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground dark:text-white sm:text-xl">{t.title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground dark:text-slate-400 sm:text-sm">{t.desc}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* No connection yet – show invite form */}
        {!connection && (
          <div className="space-y-3">
            {canUseSharedFeatures ? (
              <div className="rounded-2xl border border-border bg-muted/50 p-4 dark:border-white/10 dark:bg-[#07111f]/75">
                <div className="mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-pink-500 dark:text-pink-300" />
                  <span className="text-sm font-semibold text-foreground dark:text-slate-100">{t.inviteLabel}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.invitePlaceholder}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/30 dark:border-white/10 dark:bg-[#0a1628] dark:text-white dark:placeholder-slate-500"
                  />
                  <Button
                    onClick={handleSendInvite}
                    disabled={isLoading || !email.trim() || !canUseSharedFeatures}
                    className="rounded-xl border border-pink-300/20 bg-pink-500/10 text-sm text-pink-700 hover:bg-pink-500/15 dark:text-pink-200"
                  >
                    {t.inviteBtn}
                  </Button>
                </div>
                {inviteError && <p className="mt-2 text-xs text-rose-500">{inviteError}</p>}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 dark:border-amber-400/15">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">{t.planLockedTitle}</p>
                <p className="mt-1 text-xs leading-5 text-amber-700/90 dark:text-amber-100/90">{t.planLockedDesc}</p>
                <p className="mt-2 text-xs text-muted-foreground dark:text-slate-300">{t.planLockedHint}</p>
              </div>
            )}
            <p className="px-1 text-xs text-muted-foreground dark:text-slate-500">{t.noPartner}</p>
          </div>
        )}

        {/* Pending – sent by me */}
        {isPending && isSender && partnerUser && (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 dark:border-amber-400/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-200">
                  {t.pendingSent}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground dark:text-white">
                  {partnerUser.name} ({partnerUser.email})
                </p>
              </div>
              <Button
                onClick={() => removeConnection(connection!.id)}
                variant="ghost"
                size="sm"
                className="rounded-xl text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
              >
                <X className="mr-1 h-4 w-4" />
                {t.cancel}
              </Button>
            </div>
          </div>
        )}

        {/* Pending – received by me */}
        {isPending && !isSender && partnerUser && (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 dark:border-cyan-400/15">
            <div>
              <p className="text-sm font-medium text-cyan-700 dark:text-cyan-200">
                {t.pendingReceived}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground dark:text-white">
                {partnerUser.name} ({partnerUser.email})
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => acceptInvite(connection!.id)}
                disabled={!canUseSharedFeatures}
                className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 text-sm text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-200"
              >
                <Check className="mr-1 h-4 w-4" />
                {canUseSharedFeatures ? t.accept : t.acceptLocked}
              </Button>
              <Button
                onClick={() => removeConnection(connection!.id)}
                variant="ghost"
                className="rounded-xl text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
              >
                <X className="mr-1 h-4 w-4" />
                {t.reject}
              </Button>
            </div>
          </div>
        )}

        {/* Connected – Active */}
        {isAccepted && partnerUser && (
          <div className="space-y-3">
            {/* Connection info */}
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 dark:border-emerald-400/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">{t.connectedTo}</p>
                    <p className="text-sm font-semibold text-foreground dark:text-white">{partnerUser.name}</p>
                  </div>
                </div>
                <Button
                  onClick={() => removeConnection(connection!.id)}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                >
                  <Unlink className="mr-1 h-4 w-4" />
                  {t.disconnect}
                </Button>
              </div>
            </div>

            {/* Feature toggles */}
            {canUseSharedFeatures ? (
              <div className="rounded-2xl border border-border bg-muted/50 p-4 dark:border-white/10 dark:bg-[#07111f]/75">
                <h3 className="mb-1 text-sm font-semibold text-foreground dark:text-slate-100">{t.featureTitle}</h3>
                <p className="mb-3 text-xs text-muted-foreground dark:text-slate-400">{t.featureDesc}</p>

                <div className="space-y-2">
                  {FEATURES.map((feat) => {
                    const myAccess = getMyAccessForFeature(feat.key);
                    const partnerAccess = getPartnerAccessForFeature(feat.key);
                    const myEnabled = myAccess?.isEnabled ?? false;
                    const partnerEnabled = partnerAccess?.isEnabled ?? false;
                    const bothEnabled = myEnabled && partnerEnabled;

                    return (
                      <div key={feat.key} className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3 dark:border-white/8 dark:bg-[#040b17]/60">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground dark:text-slate-200">{feat.label[locale]}</span>
                          {myEnabled && (
                            <span className={`ml-2 text-[11px] font-medium ${bothEnabled ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}`}>
                              {bothEnabled ? t.bothEnabled : t.waitingPartner}
                            </span>
                          )}
                        </div>
                        <Switch
                          checked={myEnabled}
                          onCheckedChange={(checked) => toggleFeature(feat.key, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 dark:border-amber-400/15">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-200">{t.planLockedTitle}</p>
                <p className="mt-1 text-xs leading-5 text-amber-700/90 dark:text-amber-100/90">{t.planLockedDesc}</p>
                <p className="mt-2 text-xs text-muted-foreground dark:text-slate-300">{t.planLockedHint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
