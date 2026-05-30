export type MembershipRecord = {
  Name: string;
  MonthlyPrice: number | string;
};

export type PlanKey = 'mensual' | 'trimestral' | 'seis-meses';

type PlanDefinition = {
  key: PlanKey;
  matchers: string[];
  durationMonths: number;
  badge: string;
  recommended: boolean;
  displayOrder: number;
};

const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    key: 'mensual',
    matchers: ['mensual', '1 mes', 'un mes', '1mes'],
    durationMonths: 1,
    badge: 'Flexible',
    recommended: false,
    displayOrder: 1,
  },
  {
    key: 'trimestral',
    matchers: ['trimestral', '3 meses', 'tres meses', '3meses'],
    durationMonths: 3,
    badge: 'Más popular',
    recommended: true,
    displayOrder: 2,
  },
  {
    key: 'seis-meses',
    matchers: ['semestral', 'seis meses', '6 meses', '6meses'],
    durationMonths: 6,
    badge: 'Mejor ahorro',
    recommended: false,
    displayOrder: 3,
  },
];

// Feature matrix shared across plans. The card renders every feature with a
// check or a cross depending on whether the selected plan includes it.
type PlanFeatureDefinition = { label: string; includedIn: PlanKey[] };

const PLAN_FEATURES: PlanFeatureDefinition[] = [
  { label: 'Acceso al canal de trading en vivo con nosotros', includedIn: ['mensual', 'trimestral', 'seis-meses'] },
  { label: 'Acceso a las clases grabadas', includedIn: ['mensual', 'trimestral', 'seis-meses'] },
  { label: 'Acceso a todas las clases en vivo', includedIn: ['trimestral', 'seis-meses'] },
  { label: 'Todo el nuevo material educativo (grabado y presencial)', includedIn: ['trimestral', 'seis-meses'] },
  {
    label: 'Sesión 1-a-1 mensual: revisión de tu plan, estructuración de portafolio en todos los tipos de inversión, dudas, configuración de plataformas y recomendaciones',
    includedIn: ['seis-meses'],
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

const toNumber = (value: number | string) =>
  typeof value === 'string' ? parseFloat(value) : value;

export const findPlanDefinition = (name: string) => {
  const normalizedName = normalize(name || '');
  return PLAN_DEFINITIONS.find(definition =>
    definition.matchers.some(matcher => normalizedName.includes(normalize(matcher)))
  );
};

export type PlanFeature = { label: string; included: boolean };

export const getPlanFeatures = (name: string): PlanFeature[] => {
  const definition = findPlanDefinition(name);
  if (!definition) return [];
  return PLAN_FEATURES.map(feature => ({
    label: feature.label,
    included: feature.includedIn.includes(definition.key),
  }));
};

export const getIncludedFeatures = (name: string): string[] =>
  getPlanFeatures(name)
    .filter(feature => feature.included)
    .map(feature => feature.label);

export const getPlanDurationMonths = (name: string): number =>
  findPlanDefinition(name)?.durationMonths ?? 1;

export const getMonthlyBasePrice = (memberships: MembershipRecord[]) => {
  const monthlyPlan = memberships
    .map(member => ({ member, definition: findPlanDefinition(member.Name) }))
    .find(item => item.definition?.key === 'mensual');

  if (!monthlyPlan) return 0;

  const monthlyValue = toNumber(monthlyPlan.member.MonthlyPrice);
  return Number.isFinite(monthlyValue) ? monthlyValue : 0;
};

export const getMembershipPresentation = (
  membership: MembershipRecord,
  monthlyBasePrice: number
) => {
  const definition = findPlanDefinition(membership.Name);
  const durationMonths = definition?.durationMonths ?? 1;

  const monthlyEquivalentRaw = toNumber(membership.MonthlyPrice);
  const monthlyEquivalent = Number.isFinite(monthlyEquivalentRaw) ? monthlyEquivalentRaw : 0;

  // MonthlyPrice stores the monthly-equivalent price; the actual charge is the
  // total for the billing period (monthlyEquivalent * durationMonths).
  const totalPrice = monthlyEquivalent * durationMonths;

  const discountPercent =
    monthlyBasePrice > 0 && monthlyEquivalent > 0
      ? Math.max(0, Math.round((1 - monthlyEquivalent / monthlyBasePrice) * 100))
      : 0;

  const monthlySavings =
    monthlyBasePrice > 0
      ? Math.max(0, Math.round((monthlyBasePrice - monthlyEquivalent) * 100) / 100)
      : 0;

  const savingsTotal =
    monthlyBasePrice > 0
      ? Math.max(0, Math.round((monthlyBasePrice * durationMonths - totalPrice) * 100) / 100)
      : 0;

  return {
    isKnownPlan: Boolean(definition),
    planKey: definition?.key ?? null,
    durationMonths,
    badge: definition?.badge ?? 'Membresía',
    recommended: definition?.recommended ?? false,
    displayOrder: definition?.displayOrder ?? 99,
    monthlyEquivalent,
    totalPrice,
    discountPercent,
    monthlySavings,
    savingsTotal,
    features: getPlanFeatures(membership.Name),
  };
};

export const sortMembershipsByPlanOrder = <T extends MembershipRecord>(memberships: T[]) => {
  return [...memberships].sort((a, b) => {
    const orderA = findPlanDefinition(a.Name)?.displayOrder ?? 99;
    const orderB = findPlanDefinition(b.Name)?.displayOrder ?? 99;
    return orderA - orderB;
  });
};
