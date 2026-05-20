export function barColor(p: number): string {
    if (p === 0) return '#bfbfbf';
    if (p <= 25) return '#e74c3c';
    if (p <= 50) return '#e67e22';
    if (p <= 75) return '#f1c40f';
    return '#2ecc71';
}

export function hasAnyErrors(errors: Record<string, string>): boolean {
    return Object.values(errors).some(e => e !== '');
}