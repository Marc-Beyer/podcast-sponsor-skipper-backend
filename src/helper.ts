export function toNumber(value: string | undefined): number | undefined {
    if (value === undefined) return undefined;

    const num = Number(value);
    if (Number.isNaN(num)) return undefined;
    return num;
}

export function toNumberOrDefault(value: string | undefined, defaultValue: number): number {
    if (value === undefined) return defaultValue;

    const num = Number(value);
    if (Number.isNaN(num)) return defaultValue;
    return num;
}
