export type MembershipRecord = {
  Name: string;
  MonthlyPrice: number | string;
};

type PlanDefinition = {
  key: 'anual' | 'seis-meses' | 'trimestral' | 'mensual';
  matchers: string[];
  durationMonths: number;
  badge: string;
  recommended: boolean;
  displayOrder: number;
};

const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    key: 'anual',
    matchers: ['anual', 'annual', '12 meses', '12meses'],
    durationMonths: 12,
    badge: 'Mejor valor',
    recommended: false,
    displayOrder: 1,
  },
  {
    key: 'seis-meses',
    matchers: ['6 meses', 'seis meses', '6meses'],
    durationMonths: 6,
    badge: 'Más popular',
    recommended: true,
    displayOrder: 2,
  },
  {
    key: 'trimestral',
    matchers: ['trimestral', '3 meses', 'tres meses', '3meses'],
    durationMonths: 3,
    badge: 'Flexibilidad',
    recommended: false,
    displayOrder: 3,
  },
  {
    key: 'mensual',
    matchers: ['mensual', '1 mes', 'un mes', '1mes'],
    durationMonths: 1,
    badge: 'Acceso mensual',
    recommended: false,
    displayOrder: 4,
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

export const findPlanDefinition = (name: string) => {
  const normalizedName = normalize(name);
  return PLAN_DEFINITIONS.find(definition =>
    definition.matchers.some(matcher => normalizedName.includes(normalize(matcher)))
  );
};

export const getMonthlyBasePrice = (memberships: MembershipRecord[]) => {
  const monthlyPlan = memberships
    .map(member => ({ member, definition: findPlanDefinition(member.Name) }))
    .find(item => item.definition?.key === 'mensual');

  if (!monthlyPlan) return 0;

  const raw = monthlyPlan.member.MonthlyPrice;
  const monthlyValue = typeof raw === 'string' ? parseFloat(raw) : raw;
  return Number.isFinite(monthlyValue) ? monthlyValue : 0;
};

export const getMembershipPresentation = (
  membership: MembershipRecord,
  monthlyBasePrice: number
) => {
  const definition = findPlanDefinition(membership.Name);
  const durationMonths = definition?.durationMonths ?? 1;
  const monthlyEquivalentRaw = membership.MonthlyPrice;
  const monthlyEquivalent =
    typeof monthlyEquivalentRaw === 'string'
      ? parseFloat(monthlyEquivalentRaw)
      : monthlyEquivalentRaw;

  const totalPrice = Number.isFinite(monthlyEquivalent)
    ? monthlyEquivalent * durationMonths
    : 0;

  const discountPercent =
    monthlyBasePrice > 0 && monthlyEquivalent > 0
      ? Math.max(0, Math.round((1 - monthlyEquivalent / monthlyBasePrice) * 100))
      : 0;

  const savingsTotal =
    monthlyBasePrice > 0
      ? Math.max(0, Math.round((monthlyBasePrice * durationMonths - totalPrice) * 100) / 100)
      : 0;

  return {
    isKnownPlan: Boolean(definition),
    durationMonths,
    badge: definition?.badge ?? 'Membresía',
    recommended: definition?.recommended ?? false,
    displayOrder: definition?.displayOrder ?? 99,
    monthlyEquivalent: Number.isFinite(monthlyEquivalent) ? monthlyEquivalent : 0,
    totalPrice,
    discountPercent,
    savingsTotal,
  };
};

export const sortMembershipsByPlanOrder = <T extends MembershipRecord>(memberships: T[]) => {
  return [...memberships].sort((a, b) => {
    const orderA = findPlanDefinition(a.Name)?.displayOrder ?? 99;
    const orderB = findPlanDefinition(b.Name)?.displayOrder ?? 99;
    return orderA - orderB;
  });
};
