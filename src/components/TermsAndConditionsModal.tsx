'use client';

import { useState } from 'react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  membershipName: string;
  email: string;
  onAccept: () => void;
  onCancel: () => void;
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

export default function TermsAndConditionsModal({
  isOpen,
  membershipName,
  email,
  onAccept,
  onCancel,
}: TermsAndConditionsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAccept();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-6 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
          <p className="text-gray-600 mt-1">Trading en Vivo con Jorge y Guille</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            {TERMS_TEXT.split('\n').map((line, idx) => {
              if (!line.trim()) {
                return <div key={idx} className="h-2" />;
              }
              if (line.match(/^\d+\./)) {
                return (
                  <h3 key={idx} className="font-bold text-gray-900 mt-4 mb-2">
                    {line}
                  </h3>
                );
              }
              if (line.startsWith('-')) {
                return (
                  <li key={idx} className="text-gray-700 ml-4 list-disc">
                    {line.replace(/^-\s*/, '')}
                  </li>
                );
              }
              return (
                <p key={idx} className="text-gray-700 mb-2 text-sm leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 sticky bottom-0 bg-white rounded-b-2xl">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="terms-accepted"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 mt-1 cursor-pointer"
            />
            <label htmlFor="terms-accepted" className="text-sm text-gray-700 cursor-pointer">
              Acepto todos los Términos y Condiciones y entiendo los riesgos de operar en mercados financieros. Confirmo que he leído y comprendido completamente este contrato.
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted || isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Procesando...' : 'Aceptar y Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
