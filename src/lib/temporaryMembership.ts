/** Fixed name for the admin-controlled $150/mo temporary membership. */
export const TEMPORARY_MEMBERSHIP_NAME = 'Mensual Temporal $150';

export const TEMPORARY_MEMBERSHIP_PRICE = 150;

export const TEMPORARY_MEMBERSHIP_DEFAULTS = {
  name: TEMPORARY_MEMBERSHIP_NAME,
  description:
    'Oferta temporal por tiempo limitado. Acceso mensual al canal de trading en vivo y clases grabadas.',
  monthly_price: TEMPORARY_MEMBERSHIP_PRICE,
  benefits: [
    'Acceso al canal de trading en vivo con nosotros',
    'Acceso a las clases grabadas',
  ].join('\n'),
};

export function isTemporaryMembership(membership: {
  Name?: string;
  MonthlyPrice?: number | string;
}): boolean {
  if (!membership?.Name) return false;
  if (membership.Name.trim().toLowerCase() === TEMPORARY_MEMBERSHIP_NAME.toLowerCase()) {
    return true;
  }
  const price = Number(membership.MonthlyPrice);
  return (
    membership.Name.toLowerCase().includes('temporal') &&
    Number.isFinite(price) &&
    price === TEMPORARY_MEMBERSHIP_PRICE
  );
}
