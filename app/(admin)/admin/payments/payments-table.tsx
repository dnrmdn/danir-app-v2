"use client";

import { Clock, CheckCircle, XCircle, Eye, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { gooeyToast as toast } from "goey-toast";
import { useRouter } from "next/navigation";

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "REJECTED" }) {
  const config = {
    PENDING: {
      icon: Clock,
      label: "Pending",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    },
    APPROVED: {
      icon: CheckCircle,
      label: "Approved",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    },
    REJECTED: {
      icon: XCircle,
      label: "Rejected",
      className: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    },
  };
  const { icon: Icon, label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatAmount(amount: unknown, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(String(amount)));
}

export function PaymentsTable({ payments: initialPayments }: { payments: any[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (paymentId: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) return;

    setProcessingId(paymentId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update payment");

      toast.success(`Payment ${status.toLowerCase()} successfully`);
      
      // Update local state
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p));
      
      router.refresh(); // Refresh server props
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border dark:border-white/10 bg-muted/30 dark:bg-white/[0.02]">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Invoice</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">User</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Amount</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Proof</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500 hidden lg:table-cell">Submitted</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-white/5">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-4">
                <code className="text-[10px] font-mono text-muted-foreground dark:text-slate-400 bg-muted dark:bg-white/5 px-1.5 py-0.5 rounded">
                  {payment.invoiceCode}
                </code>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-400/20 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                    {payment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground dark:text-white truncate max-w-[120px]">{payment.user.name}</p>
                    <p className="text-[10px] text-muted-foreground dark:text-slate-500 truncate max-w-[120px]">{payment.user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm font-medium text-foreground dark:text-white">
                <div className="flex flex-col">
                  <span>{formatAmount(payment.amount, payment.currency)}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{payment.paymentMethod}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                {payment.proofImageUrl ? (
                  <a href={payment.proofImageUrl} target="_blank" rel="noreferrer" className="group relative flex h-10 w-10 overflow-hidden rounded-lg border border-border dark:border-white/10 hover:border-cyan-500 transition-colors">
                    <Image src={payment.proofImageUrl} alt="Proof" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground select-none">—</span>
                )}
              </td>
              <td className="px-5 py-4 text-[11px] text-muted-foreground dark:text-slate-500 hidden lg:table-cell">
                {formatDate(payment.submittedAt)}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={payment.status} />
              </td>
              <td className="px-5 py-4 text-right">
                {payment.status === "PENDING" ? (
                  <div className="flex justify-end gap-1.5">
                    <button 
                      onClick={() => handleAction(payment.id, "REJECTED")}
                      disabled={processingId === payment.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                      title="Reject"
                    >
                      {processingId === payment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleAction(payment.id, "APPROVED")}
                      disabled={processingId === payment.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                      title="Approve"
                    >
                      {processingId === payment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                   <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-30 select-none">No Actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
