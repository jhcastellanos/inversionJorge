'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  membershipName: string;
  email: string;
  includedFeatures?: string[];
  priceLabel?: string;
  onAccept: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  scrollHint?: string;
}

const TERMS_TEXT = `TÉRMINOS Y CONDICIONES
Trading en Vivo con Jorge y Guille

Última actualización: 1ro de Febrero de 2026

Al suscribirse a la membresía "Trading en Vivo con Jorge y Guille", el usuario acepta expresamente los siguientes Términos y Condiciones.

1. NATURALEZA DEL SERVICIO

La membresía "Trading en Vivo con Jorge y Guille" es un servicio de acceso a sesiones de trading en tiempo real dentro de la comunidad privada de Discord Inversión Real.

Este servicio consiste exclusivamente en:
- Transmisión en vivo de operativas realizadas por los hosts
- Comentarios en tiempo real sobre decisiones propias de mercado
- Acceso a canal de chat durante la sesión

Este servicio NO constituye:
- Asesoría financiera personalizada
- Recomendación individual de inversión
- Gestión de portafolio
- Servicio de brokeraje
- Promesa de rentabilidad

2. DECLARACIÓN DE RIESGO

El usuario reconoce y acepta que:
- Operar en mercados financieros, incluyendo opciones, conlleva alto riesgo
- Puede perder parcial o totalmente el capital invertido
- El desempeño pasado NO garantiza resultados futuros
- Las decisiones tomadas durante la sesión son responsabilidad exclusiva del usuario
- Los hosts no garantizan resultados ni porcentajes de ganancia

El usuario declara que:
- Tiene conocimiento previo de opciones financieras
- Opera bajo su propio criterio
- Es mayor de edad y legalmente capaz de contratar

3. NO RELACIÓN DE ASESORÍA PERSONAL

Jorge y Guille no actúan como:
- Asesores financieros registrados
- Investment Advisors
- Broker-Dealers
- Fiduciarios del usuario

Las sesiones son de carácter informativo y demostrativo.
Cada usuario ejecuta sus operaciones bajo su propia responsabilidad.

4. LIMITACIÓN DE RESPONSABILIDAD

Bajo ninguna circunstancia Jorge, Guille ni la comunidad Inversión Real serán responsables por:
- Pérdidas financieras
- Daños directos o indirectos
- Decisiones tomadas por el usuario
- Fallas técnicas de Discord o plataformas de terceros
- Errores de ejecución del broker del usuario

La responsabilidad total, en cualquier caso, estará limitada al monto pagado por el mes activo de membresía.

5. ALCANCE DEL SERVICIO

El usuario acepta que:
- Este espacio está enfocado en operativa en vivo
- Se utilizará lenguaje técnico propio del trading
- No se detendrá la sesión para explicar conceptos básicos
- Se recomienda tener conocimientos previos de opciones antes de suscribirse

6. FACTURACIÓN Y PAGOS

- La membresía es mensual
- El pago es recurrente
- No existen reembolsos por días no utilizados
- Al cancelar, el usuario mantiene acceso hasta el final del ciclo activo
- Es responsabilidad del usuario cancelar antes del próximo ciclo si no desea continuar

7. CONDUCTA DEL USUARIO

El usuario acepta:
- Mantener respeto dentro del chat
- No interrumpir el orden del lobby
- No difundir información privada
- No grabar, redistribuir o revender el contenido sin autorización
- Cualquier conducta inapropiada podrá resultar en expulsión sin derecho a reembolso

8. PROPIEDAD INTELECTUAL

Todo el contenido transmitido (Estrategias, Comentarios, Análisis, Metodologías, Marca) son propiedad exclusiva de los hosts.

Queda prohibida su reproducción o redistribución sin autorización escrita.

9. CUMPLIMIENTO REGULATORIO

El usuario entiende que:
- El servicio no constituye oferta pública de valores
- No se están vendiendo instrumentos financieros
- Se trata de un espacio privado de acceso por membresía
- El usuario es responsable de cumplir con las regulaciones de su país o jurisdicción

10. ACEPTACIÓN EXPRESA

Al suscribirse, el usuario declara que:
- Ha leído completamente estos Términos
- Comprende los riesgos
- Acepta operar bajo su propia responsabilidad
- Libera a los hosts de cualquier reclamo futuro relacionado con pérdidas financieras

NOTA IMPORTANTE: Aunque se use el nombre de otra persona en la compra, es quien utilizaremos como firmante y responsable de este contrato. La persona que opere con ese pseudónimo no tiene derecho de reclamación al no tener nada firmado.`;

function TermsBody() {
  return (
    <div className="prose prose-sm max-w-none">
      {TERMS_TEXT.split('\n').map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }
        if (line.match(/^\d+\./)) {
          return (
            <h3 key={idx} className="font-bold ventic-text mt-4 mb-2">
              {line}
            </h3>
          );
        }
        if (line.startsWith('-')) {
          return (
            <li key={idx} className="ventic-muted ml-4 list-disc">
              {line.replace(/^-\s*/, '')}
            </li>
          );
        }
        return (
          <p key={idx} className="ventic-muted mb-2 text-sm leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function TermsAndConditionsModal({
  isOpen,
  membershipName,
  includedFeatures = [],
  priceLabel,
  onAccept,
  onCancel,
  isLoading = false,
  scrollHint = 'Desplázate hasta el final de los términos para continuar.',
}: TermsAndConditionsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (atEnd) setScrolledToEnd(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setAccepted(false);
    setScrolledToEnd(false);
    requestAnimationFrame(() => {
      checkScrollEnd();
    });
  }, [isOpen, membershipName, checkScrollEnd]);

  if (!isOpen) return null;

  const actionsEnabled = scrolledToEnd;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="mb-4 rounded-xl border ventic-border bg-ventic-accent-soft/40 p-4 shrink-0">
        <h3 className="font-bold ventic-text mb-1">Plan seleccionado: {membershipName}</h3>
        {priceLabel && (
          <p className="text-sm ventic-muted mb-2">
            <strong>Precio:</strong> {priceLabel}
          </p>
        )}
        {includedFeatures.length > 0 && (
          <>
            <p className="text-sm font-semibold ventic-text mb-1">Este plan incluye:</p>
            <ul className="list-disc list-inside space-y-1 mb-2">
              {includedFeatures.map((feature, idx) => (
                <li key={idx} className="text-sm ventic-muted">
                  {feature}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          Ningún pago es reembolsable. Al continuar confirmas que has elegido este plan de forma consciente y
          aceptas que no habrá reembolsos por ningún motivo.
        </p>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScrollEnd}
        className="flex-1 min-h-[200px] max-h-[42vh] overflow-y-auto rounded-lg border ventic-border p-4 mb-3"
      >
        <TermsBody />
      </div>

      {!scrolledToEnd && (
        <p className="text-xs text-center ventic-muted mb-3 shrink-0">{scrollHint}</p>
      )}

      <div className="border-t ventic-border pt-4 shrink-0">
        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            id="terms-accepted"
            checked={accepted}
            disabled={!actionsEnabled}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-[var(--ventic-accent)] mt-1 disabled:opacity-40"
          />
          <label
            htmlFor="terms-accepted"
            className={`text-sm ventic-muted ${actionsEnabled ? 'cursor-pointer' : 'opacity-60'}`}
          >
            Acepto los Términos y Condiciones del plan <strong>{membershipName}</strong>, entiendo los riesgos
            de operar en mercados financieros y confirmo que <strong>ningún pago es reembolsable</strong>.
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={!actionsEnabled || isSubmitting || isLoading}
            className="flex-1 rounded-lg border ventic-border px-4 py-2.5 text-sm font-semibold ventic-text hover:bg-ventic-accent-soft disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!actionsEnabled || !accepted || isSubmitting || isLoading}
            className="flex-1 rounded-lg bg-[var(--ventic-accent)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--ventic-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? 'Procesando…' : 'Aceptar y Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
}
