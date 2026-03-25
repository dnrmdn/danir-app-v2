export function formatAmountInput(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat("id-ID").format(Number(digits));
}

export function parseAmountInput(value: string) {
    return value.replace(/\D/g, "");
}