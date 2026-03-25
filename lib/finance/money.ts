import { Prisma } from "@/lib/generated/prisma";

export function toDecimal(value: unknown): Prisma.Decimal {
    if (value instanceof Prisma.Decimal) return value;

    if (typeof value === "number") {
        if (!Number.isFinite(value)) throw new Error("Nominal tidak valid");
        return new Prisma.Decimal(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) throw new Error("Nominal wajib diisi");
        const num = Number(trimmed);
        if (!Number.isFinite(num)) throw new Error("Nominal tidak valid");
        return new Prisma.Decimal(trimmed);
    }

    throw new Error("Nominal tidak valid");
}

export function parseDate(value: unknown): Date {
    if (typeof value !== "string" || !value.trim()) return new Date();
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw new Error("Tanggal tidak valid");
    return d;
}

export function assertPositiveDecimal(value: Prisma.Decimal, message = "Nominal harus > 0") {
    if (value.lte(0)) {
        throw new Error(message);
    }
}

export function assertSufficientBalance(
    balance: Prisma.Decimal,
    amount: Prisma.Decimal,
    message = "Saldo tidak cukup"
) {
    if (balance.lt(amount)) {
        throw new Error(message);
    }
}