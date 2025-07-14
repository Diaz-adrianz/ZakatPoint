import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMoney(
    number?: number,
    {
        locale = 'id-ID',
        currency = 'IDR',
        shorten = false,
    }: {
        locale?: string;
        currency?: string;
        shorten?: boolean;
    } = {},
) {
    if (!number) return 'Rp 0';

    let formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(number);

    if (formatted.includes(',')) {
        formatted = formatted.replace(/,00$/, '');
    }

    if (shorten) {
        if (number >= 1_000_000_000_000) {
            // Triliun
            formatted = `Rp ${(number / 1_000_000_000_000).toFixed(2).replace(/\.0+$/, '')}T`;
        } else if (number >= 1_000_000_000) {
            // Miliar
            formatted = `Rp ${(number / 1_000_000_000).toFixed(2).replace(/\.0+$/, '')}M`;
        } else if (number >= 1_000_000) {
            // Juta
            formatted = `Rp ${(number / 1_000_000).toFixed(2).replace(/\.0+$/, '')}jt`;
        } else if (number >= 1_000) {
            // Ribu
            formatted = `Rp ${(number / 1_000).toFixed(0)}rb`;
        }
    }

    return formatted;
}
