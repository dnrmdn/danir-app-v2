"use client";

import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useLanguage } from "@/components/language-provider";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  CreditCard,
  ShieldCheck,
  Infinity as InfinityIcon,
  Lock,
  ArrowLeft,
  ChevronRight,
  QrCode,
  Building2,
  Copy,
  Check,
  Upload,
  Loader2,
  AlertCircle,
  FileImage,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { gooeyToast as toast } from "goey-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRO_PRICE = "119.000";
const BCA_HOLDER = "DANI RAMDANI";
const BCA_NUMBER = "1092518331"; // Placeholder BCA

// ─── i18n ─────────────────────────────────────────────────────────────────────

const content = {
  id: {
    back: "Kembali ke Pengatur",
    currentPlan: "Paket saat ini",
    ctaFree: "Upgrade Sekarang",
    ctaTrial: "Lanjutkan ke Pro",
    trialLeft: "Sisa trial",
    days: "hari",
    proActive: "Paket Pro Aktif",
    proDesc: "Nikmati akses penuh tanpa batasan di seluruh fitur Danir.",

    benefitsTitle: "Keuntungan Danir Pro",
    benefits: [
      "Fitur Shared (Money Tracker & Meal Plan) aktif",
      "Saved links tanpa batas (Unlimited)",
      "Riwayat keuangan penuh tanpa batas waktu",
      "Akses prioritas fitur baru",
      "Tanpa biaya berulang (Sekali bayar)",
    ],

    paymentTitle: "Pilih Metode Pembayaran",
    paymentDesc: "Pilih metode yang paling nyaman untuk Anda.",
    qrisLabel: "QRIS (Rekomendasi)",
    qrisSub: "Instan & Mudah",
    bcaLabel: "Transfer Bank BCA",
    bcaSub: "Alternatif Transfer",

    payAmount: "Total Bayar",
    invoiceCode: "Kode Invoice",
    instructionTitle: "Instruksi Pembayaran",
    qrisInstruction: "Scan kode QR di atas menggunakan aplikasi bank atau e-wallet (Dana, OVO, GoPay, dll).",
    bcaInstruction: "Transfer ke rekening BCA di atas sesuai nominal yang tertera.",
    copySuccess: "Berhasil disalin",

    btnPaid: "Saya Sudah Bayar",
    btnSubmitting: "Mengirim...",
    btnSubmit: "Kirim Konfirmasi",

    formTitle: "Konfirmasi Pembayaran",
    formDesc: "Lengkapi data berikut agar admin dapat memverifikasi pembayaran Anda.",
    payerNameLabel: "Nama Pengirim (Sesuai Rekening/E-wallet)",
    payerNamePlaceholder: "Contoh: Budi Santoso",
    proofLabel: "Unggah Bukti Pembayaran",
    proofHint: "Format JPG/PNG, Maksimal 5MB",
    notesLabel: "Catatan Tambahan (Opsional)",
    notesPlaceholder: "Misal: Nama bank jika berbeda",

    pendingTitle: "Pembayaran Sedang Diverifikasi",
    pendingDesc: "Terima kasih! Bukti pembayaran Anda telah kami terima dan sedang ditinjau oleh tim admin. Proses ini biasanya memakan waktu 1-24 jam.",
    pendingBtn: "Kembali ke Beranda",

    errorNoFile: "Harap unggah bukti pembayaran",
    errorNoName: "Nama pengirim harus diisi",
    errorSubmit: "Gagal mengirim konfirmasi. Silakan coba lagi.",
    successSubmit: "Konfirmasi berhasil dikirim!",
  },
  en: {
    back: "Back to Settings",
    currentPlan: "Current plan",
    ctaFree: "Upgrade Now",
    ctaTrial: "Continue to Pro",
    trialLeft: "Trial left",
    days: "days",
    proActive: "Pro Plan Active",
    proDesc: "Enjoy full access across all Danir features.",

    benefitsTitle: "Danir Pro Benefits",
    benefits: [
      "Shared features active (Money Tracker & Meal Plan)",
      "Unlimited saved links",
      "Full money history without time limits",
      "Priority access to new features",
      "One-time payment (No recurring fees)",
    ],

    paymentTitle: "Select Payment Method",
    paymentDesc: "Choose the method that works best for you.",
    qrisLabel: "QRIS (Recommended)",
    qrisSub: "Instant & Easy",
    bcaLabel: "BCA Bank Transfer",
    bcaSub: "Alternative Transfer",

    payAmount: "Total Amount",
    invoiceCode: "Invoice Code",
    instructionTitle: "Payment Instructions",
    qrisInstruction: "Scan the QR code above using your banking app or e-wallet (Dana, OVO, GoPay, etc).",
    bcaInstruction: "Transfer to the BCA account above exactly as the amount shown.",
    copySuccess: "Copied successfully",

    btnPaid: "I Have Paid",
    btnSubmitting: "Submitting...",
    btnSubmit: "Submit Confirmation",

    formTitle: "Payment Confirmation",
    formDesc: "Complete the form below so our admin can verify your payment.",
    payerNameLabel: "Payer Name (Account Holder Name)",
    payerNamePlaceholder: "Example: John Doe",
    proofLabel: "Upload Payment Proof",
    proofHint: "JPG/PNG format, Max 5MB",
    notesLabel: "Additional Notes (Optional)",
    notesPlaceholder: "E.g. Bank name if different",

    pendingTitle: "Payment Under Review",
    pendingDesc: "Thank you! We've received your payment proof and it's being reviewed by our admin team. This usually takes 1-24 hours.",
    pendingBtn: "Back to Home",

    errorNoFile: "Please upload payment proof",
    errorNoName: "Payer name is required",
    errorSubmit: "Failed to submit. Please try again.",
    successSubmit: "Confirmation sent successfully!",
  },
} as const;

// ─── Components ───────────────────────────────────────────────────────────────

function PlanPill({ planType, locale }: { planType: "FREE" | "PRO_TRIAL" | "PRO"; locale: string }) {
  if (planType === "PRO") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/50 bg-gradient-to-r from-cyan-400/20 to-emerald-400/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/25 dark:text-cyan-300">
        <Sparkles className="h-3 w-3" />
        Danir Pro
      </span>
    );
  }
  if (planType === "PRO_TRIAL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
        <Clock className="h-3 w-3" />
        Pro Trial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
      <Zap className="h-3 w-3" />
      {locale === "id" ? "Paket Gratis" : "Free Plan"}
    </span>
  );
}

export default function BillingPage() {
  const { plan, loading: planLoading, reload: reloadPlan } = usePlanAccess();
  const { locale } = useLanguage();
  const t = content[locale];

  // UI States
  const [step, setStep] = useState<"overview" | "payment" | "confirmation">("overview");
  const [method, setMethod] = useState<"QRIS" | "BCA_TRANSFER">("QRIS");
  const [copied, setCopied] = useState(false);

  // Form State
  const [payerName, setPayerName] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pending State
  const [pendingPayment, setPendingPayment] = useState<any>(null);
  const [checkLoading, setCheckLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for existing pending payments
  useEffect(() => {
    async function checkPayments() {
      try {
        const res = await fetch("/api/user/payments");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          // Find if there is a pending one
          const pending = json.data.find((p: any) => p.status === "PENDING");
          if (pending) setPendingPayment(pending);
        }
      } catch (err) {
        console.error("Check payments error:", err);
      } finally {
        setCheckLoading(false);
      }
    }
    checkPayments();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error(locale === "id" ? "Ukuran file maksimal 5MB" : "File size max 5MB");
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t.errorNoFile);
      return;
    }
    if (!payerName.trim()) {
      toast.error(t.errorNoName);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("paymentMethod", method);
      formData.append("payerName", payerName);
      formData.append("notes", notes);
      formData.append("proof", file);

      const res = await fetch("/api/user/payments", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || t.errorSubmit);
      }

      toast.success(t.successSubmit);
      setPendingPayment(json.data);
      setStep("overview");
    } catch (err: any) {
      toast.error(err.message || t.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already Pro, show Pro page
  if (!planLoading && plan?.isPaidPro) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.back}
        </Link>

        <section className="overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-2xl shadow-cyan-950/10 dark:border-white/10 dark:bg-[#08111f]/90 sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-foreground dark:text-white">{t.proActive}</h1>
          <p className="mt-3 text-muted-foreground dark:text-slate-400">{t.proDesc}</p>
          <div className="mt-8">
            <PlanPill planType="PRO" locale={locale} />
          </div>
        </section>
      </div>
    );
  }

  // If pending payment exists, show Pending view
  if (!checkLoading && pendingPayment) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-2xl shadow-cyan-950/10 dark:border-white/10 dark:bg-[#08111f]/90 sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/20 bg-amber-400/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-tight">{t.pendingTitle}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground dark:text-slate-400 max-w-md mx-auto">{t.pendingDesc}</p>

          <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t.invoiceCode}</span>
              <span className="font-mono font-bold text-foreground dark:text-white">{pendingPayment.invoiceCode}</span>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">{locale === "id" ? "Metode" : "Method"}</span>
              <span className="font-bold text-foreground dark:text-white">{pendingPayment.paymentMethod === "QRIS" ? "QRIS" : "BCA Transfer"}</span>
            </div>
          </div>

          <Link href="/" className="mt-10 inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-sm font-bold text-background transition hover:opacity-90 dark:bg-white dark:text-black">
            {t.pendingBtn}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-20">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.back}
      </Link>

      <AnimatePresence mode="wait">
        {/* STEP 1: OVERVIEW */}
        {step === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
            {/* Plan Info Bar */}
            <section className="flex items-center justify-between rounded-3xl border border-border bg-card p-5 dark:border-white/10 dark:bg-white/4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.currentPlan}</p>
                <div className="mt-1">
                  {planLoading ? (
                    <div className="h-6 w-24 animate-pulse rounded-full bg-muted dark:bg-white/10" />
                  ) : (
                    <PlanPill planType={plan?.planType || "FREE"} locale={locale} />
                  )}
                </div>
              </div>
              {!planLoading && plan?.isTrialActive && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.trialLeft}</p>
                  <p className="mt-0.5 text-lg font-black text-cyan-600 dark:text-cyan-400">{plan.trialDaysRemaining} {t.days}</p>
                </div>
              )}
            </section>

            {/* Benefits Card */}
            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-2xl shadow-cyan-950/5 dark:border-white/10 dark:bg-[#08111f]/95 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground dark:text-white">{t.benefitsTitle}</h2>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400 font-bold tracking-tight">Rp {PRO_PRICE} <span className="text-muted-foreground font-normal text-xs ml-1 opacity-70">/ {locale === "id" ? "Selamanya" : "Lifetime"}</span></p>
                </div>
              </div>

              <ul className="space-y-4">
                {t.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 dark:text-slate-300">{b}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => setStep("payment")} className="mt-10 group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-[0.98]">
                <span className="relative flex items-center justify-center gap-2">
                  {t.ctaFree}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </button>
            </section>
          </motion.div>
        )}

        {/* STEP 2: PAYMENT METHOD */}
        {step === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white uppercase">{t.paymentTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">{t.paymentDesc}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => setMethod("QRIS")} className={`relative flex flex-col items-start rounded-[1.75rem] border p-5 text-left transition ${method === "QRIS" ? "border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-400/5" : "border-border bg-card hover:bg-muted/50 dark:border-white/10 dark:bg-white/4"
                }`}>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${method === "QRIS" ? "bg-cyan-500 text-white" : "bg-muted text-muted-foreground dark:bg-white/10"}`}>
                  <QrCode className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-foreground dark:text-white">{t.qrisLabel}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.qrisSub}</div>
                {method === "QRIS" && (
                  <div className="absolute top-4 right-4 text-cyan-500 dark:text-cyan-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
                <div className="mt-3 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {locale === "id" ? "REKOMENDASI" : "RECOMMENDED"}
                </div>
              </button>

              <button onClick={() => setMethod("BCA_TRANSFER")} className={`relative flex flex-col items-start rounded-[1.75rem] border p-5 text-left transition ${method === "BCA_TRANSFER" ? "border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500 dark:border-cyan-400 dark:bg-cyan-400/5" : "border-border bg-card hover:bg-muted/50 dark:border-white/10 dark:bg-white/4"
                }`}>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${method === "BCA_TRANSFER" ? "bg-cyan-500 text-white" : "bg-muted text-muted-foreground dark:bg-white/10"}`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-foreground dark:text-white">{t.bcaLabel}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.bcaSub}</div>
                {method === "BCA_TRANSFER" && (
                  <div className="absolute top-4 right-4 text-cyan-500 dark:text-cyan-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </button>
            </div>

            {/* Instruction Area */}
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl dark:border-white/10 dark:bg-[#0b1525]/95">
              {method === "QRIS" ? (
                <div className="text-center">
                  <div className="relative mx-auto mb-6 h-64 w-64 overflow-hidden rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg">
                    <Image src="/images/qris-placeholder.png" alt="QRIS Danir" fill className="object-cover" />
                  </div>
                  <div className="space-y-4 px-4 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.payAmount}</p>
                      <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">Rp {PRO_PRICE}</p>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground dark:text-slate-400">{t.qrisInstruction}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bank</p>
                        <p className="font-bold text-foreground dark:text-white">Bank BCA</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{locale === "id" ? "Nomor Rekening" : "Account Number"}</p>
                          <p className="text-xl font-mono font-bold text-foreground dark:text-white">{BCA_NUMBER}</p>
                        </div>
                        <button onClick={() => handleCopy(BCA_NUMBER)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted hover:bg-muted transition dark:bg-white/10 dark:hover:bg-white/15">
                          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{locale === "id" ? "Atas Nama" : "Account Name"}</p>
                        <p className="font-bold text-foreground dark:text-white uppercase">{BCA_HOLDER}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.payAmount}</p>
                      <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">Rp {PRO_PRICE}</p>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground dark:text-slate-400">{t.bcaInstruction}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep("overview")} className="flex-1 rounded-2xl border border-border bg-card py-4 text-sm font-bold text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/4">
                  {locale === "id" ? "Batal" : "Cancel"}
                </button>
                <button onClick={() => setStep("confirmation")} className="flex-[2] rounded-2xl bg-foreground py-4 text-sm font-bold text-background transition hover:opacity-90 dark:bg-white dark:text-black">
                  {t.btnPaid}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: CONFIRMATION FORM */}
        {step === "confirmation" && (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white uppercase">{t.formTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">{t.formDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl dark:border-white/10 dark:bg-[#0b1525]/95 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t.payerNameLabel}</label>
                <input
                  type="text"
                  value={payerName}
                  onChange={e => setPayerName(e.target.value)}
                  placeholder={t.payerNamePlaceholder}
                  className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 text-sm focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t.proofLabel}</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-border py-10 transition hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.01] ${preview ? "border-emerald-500/50" : ""}`}
                >
                  <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />

                  {preview ? (
                    <div className="relative h-40 w-full overflow-hidden px-10">
                      <Image src={preview} alt="Proof preview" fill className="rounded-xl object-contain" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground group-hover:bg-cyan-500 group-hover:text-white transition dark:bg-white/5">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground dark:text-white">{locale === "id" ? "Klik untuk mengunggah" : "Click to upload"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.proofHint}</p>
                    </>
                  )}

                  {preview && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <FileImage className="h-3.5 w-3.5" />
                      {file?.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t.notesLabel}</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-muted/50 px-5 py-4 text-sm focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-white/5 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep("payment")} className="flex-1 rounded-2xl border border-border bg-card py-4 text-sm font-bold text-foreground transition hover:bg-muted dark:border-white/10 dark:bg-white/4">
                  {locale === "id" ? "Kembali" : "Back"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-4 text-sm font-bold text-white transition hover:bg-cyan-500 shadow-lg shadow-cyan-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.btnSubmitting}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t.btnSubmit}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-50">
        <ShieldCheck className="h-3 w-3" />
        Secure Payment & Admin Verified
      </div>
    </div>
  );
}
