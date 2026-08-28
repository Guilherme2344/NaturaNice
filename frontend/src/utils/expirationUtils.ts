export interface ExpirationFormat {
    text: string;
    type: 'EXPIRED' | 'NEAR_EXPIRATION' | 'NORMAL';
    daysRemaining: number;
}

/**
 * Calculates remaining expiration time and formats the label according to exact rules:
 * - Expired (days < 0): Red background, e.g. "Vencido há X dias"
 * - Near Expiration (0 <= days <= 180): Yellow background, e.g. "Vence hoje" or "Vence em X dias"
 * - Normal (> 180 days): Plain bold text without background color
 *   - Formatted in years, months and days (e.g. "Faltam 1 ano, 2 meses e 5 dias")
 */
export function formatExpirationStatus(expirationDateStr: string | null | undefined): ExpirationFormat {
    if (!expirationDateStr) {
        return {
            text: 'Data não informada',
            type: 'NORMAL',
            daysRemaining: 0,
        };
    }

    const expDate = new Date(expirationDateStr);
    const today = new Date();

    // Reset hours to midnight for exact date comparison
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        const absDays = Math.abs(daysRemaining);
        const text = absDays === 1 ? 'Vencido há 1 dia' : `Vencido há ${absDays} dias`;
        return { text, type: 'EXPIRED', daysRemaining };
    }

    if (daysRemaining === 0) {
        return { text: 'Vence hoje', type: 'NEAR_EXPIRATION', daysRemaining };
    }

    // Near Expiration (1 to 180 days): Yellow background
    if (daysRemaining <= 180) {
        const text = daysRemaining === 1 ? 'Vence em 1 dia' : `Vence em ${daysRemaining} dias`;
        return { text, type: 'NEAR_EXPIRATION', daysRemaining };
    }

    // Normal (> 180 days): Plain bold text, no background color
    const years = Math.floor(daysRemaining / 365);
    const remAfterYears = daysRemaining % 365;
    const months = Math.floor(remAfterYears / 30);
    const days = remAfterYears % 30;

    const parts: string[] = [];
    if (years > 0) {
        parts.push(years === 1 ? '1 ano' : `${years} anos`);
    }
    if (months > 0) {
        parts.push(months === 1 ? '1 mês' : `${months} meses`);
    }
    if (days > 0) {
        parts.push(days === 1 ? '1 dia' : `${days} dias`);
    }

    let durationText = '';
    if (parts.length === 1) {
        durationText = parts[0];
    } else if (parts.length === 2) {
        durationText = `${parts[0]} e ${parts[1]}`;
    } else if (parts.length === 3) {
        durationText = `${parts[0]}, ${parts[1]} e ${parts[2]}`;
    } else {
        durationText = `${daysRemaining} dias`;
    }

    return {
        text: `Faltam ${durationText}`,
        type: 'NORMAL',
        daysRemaining,
    };
}
