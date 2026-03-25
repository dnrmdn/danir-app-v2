
import { format } from "date-fns";
import { gooeyToast as toast } from "goey-toast";

export function toNumber(value: unknown) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

export function monthString(date = new Date()) {
    return format(date, "yyyy-MM");
}

export function monthRange(month: string) {
    const [y, m] = month.split("-").map((v) => Number(v));
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    return { start, end };
}

export function formatMoney(amount: number, currency: string) {
    try {
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
        return formatted.replace(/^Rp(?=\d)/i, "Rp ");
    } catch {
        return `${currency} ${amount.toLocaleString("id-ID")}`;
    }
}

export function formatDashboardCurrency(amount: number, currency = "IDR") {
    const absolute = Math.abs(amount);

    if (absolute >= 1_000_000_000) {
        const compact = amount / 1_000_000_000;
        return `Rp ${compact.toFixed(1)}B`;
    }

    return formatMoney(amount, currency);
}

export function showSuccessToast(message: string) {
    toast.success(message);
}

export function showErrorToast(message: string) {
    toast.error(message);
}

export function showDeleteConfirmToast(title: string, onConfirm: () => void) {
    toast.warning(title, {
        action: {
            label: "Hapus",
            onClick: onConfirm,
        },
        duration: 5000,
    });
}

export function asIncomeExpense(value: string): "INCOME" | "EXPENSE" {
    return value === "INCOME" ? "INCOME" : "EXPENSE";
}

export function asAccountType(value: string): "CASH" | "BANK" | "EWALLET" {
    if (value === "BANK") return "BANK";
    if (value === "EWALLET") return "EWALLET";
    return "CASH";
}
export function formatCompactNumber(value: number) {
    if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value.toString();
}
