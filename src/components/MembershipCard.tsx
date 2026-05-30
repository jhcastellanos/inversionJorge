'use client';

import { useState } from 'react';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import { getMembershipPresentation } from '../lib/membershipPlans';

interface MembershipCardProps {
  membership: {
    Id: number;
    Name: string;
    Description: string;
    MonthlyPrice: number;
    Benefits: string;
    ImageUrl?: string | null;
  };
  monthlyBasePrice: number;
}

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) return '0';
  const hasDecimals = Math.round(value) !== value;
  return value.toFixed(hasDecimals ? 2 : 0);
};

export default function MembershipCard({ membership, monthlyBasePrice }: MembershipCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const plan = getMembershipPresentation(membership, monthlyBasePrice);
  const includedFeatures = plan.features.filter(f => f.included).map(f => f.label);
  const isRecurringPeriod = plan.durationMonths > 1;
  const intervalLabel = plan.durationMonths === 1 ? '/mes' : `cada ${plan.durationMonths} meses`;

  const handleSubscribeClick = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentClose = () => {
    setShowPaymentForm(false);
    setCustomerName('');
    setCustomerEmail('');
  };

  const handleBuyClick = () => {
    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    if (!customerEmail.trim()) {
      alert('Por favor ingresa tu email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    setShowPaymentForm(false);
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    try {
      setIsLoading(true);

      // The contract PDF + emails are generated only AFTER payment succeeds, so
      // we go straight to checkout.
      const res = await fetch('/api/stripe/subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: membership.Id,
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error;
        console.error('Subscription error details:', data);
        alert(errorMessage);
      } else {
        alert('Error desconocido al procesar la suscripción');
      }

      setShowTermsModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la suscripción');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsCancel = () => {
    setShowTermsModal(false);
    setShowPaymentForm(true);
  };

  return (
    <>
      <div
        className={`group relative flex flex-col h-full w-full rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 bg-white ${
          plan.recommended
            ? 'border-indigo-500 ring-2 ring-indigo-300 lg:scale-[1.03] z-10'
            : 'border-gray-200'
        }`}
      >
        {/* Badge superior */}
        <div
          className={`py-3 px-6 text-center ${
            plan.recommended
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-gray-50 text-gray-700'
          }`}
        >
          <span className="font-bold uppercase text-sm tracking-wide">{plan.badge}</span>
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Nombre */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {membership.Name}
          </h3>

          {/* Descripción */}
          {membership.Description && (
            <div className="mb-4 text-center">
              <p className={`text-gray-600 text-sm ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                {membership.Description}
              </p>
              {membership.Description.length > 100 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 mt-1 font-medium"
                >
                  {showFullDescription ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}

          {/* Precio */}
          <div className="text-center mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-semibold text-gray-500">$</span>
              <span className="text-5xl font-extrabold text-gray-900">
                {formatMoney(plan.totalPrice)}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{intervalLabel}</p>

            {isRecurringPeriod && (
              <p className="text-sm text-gray-600 mt-2">
                Equivale a{' '}
                <span className="font-semibold text-gray-900">
                  ${formatMoney(plan.monthlyEquivalent)}/mes
                </span>
              </p>
            )}

            {plan.monthlySavings > 0 && (
              <div className="inline-flex items-center gap-1 mt-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Ahorras ${formatMoney(plan.monthlySavings)}/mes
              </div>
            )}
          </div>

          {/* Toggle "Ver más" - solo en móvil para mantener la tarjeta compacta */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="md:hidden mb-4 flex items-center justify-center gap-1 w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            aria-expanded={showDetails}
          >
            {showDetails ? 'Ver menos' : 'Ver qué incluye'}
            <svg
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Beneficios con checks/cruces (colapsado en móvil, siempre visible en escritorio) */}
          <ul className={`space-y-3 mb-6 md:flex-1 ${showDetails ? 'block' : 'hidden'} md:block`}>
            {plan.features.map((feature, index) => (
              <li
                key={index}
                className={`flex items-start gap-2 text-sm ${
                  feature.included ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {feature.included ? (
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>

          {/* Botón */}
          <button
            onClick={handleSubscribeClick}
            className={`w-full py-3 px-6 rounded-xl font-semibold transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg ${
              plan.recommended
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Suscribirme
          </button>

          {/* Nota de no reembolso */}
          <p className="text-xs text-center text-gray-500 mt-3">
            Pago no reembolsable. Elige bien tu plan antes de suscribirte.
          </p>
          <p className="text-xs text-center text-gray-400 mt-1">
            Procesado de forma segura por Stripe
          </p>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && !showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Completar Suscripción</h2>
              <p className="text-gray-600 mt-1">{membership.Name}</p>
            </div>

            <div className="p-6">
              <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${formatMoney(plan.totalPrice)} {intervalLabel}
                  </span>
                </div>
                {isRecurringPeriod && (
                  <p className="text-xs text-gray-500 text-right mt-1">
                    Equivale a ${formatMoney(plan.monthlyEquivalent)}/mes
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePaymentClose}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBuyClick}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="border-b p-6 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
              <p className="text-gray-600 mt-1">{membership.Name}</p>
              <div className="mt-3 pt-3 border-t space-y-1">
                <p className="text-sm text-gray-600"><strong>Nombre:</strong> {customerName}</p>
                <p className="text-sm text-gray-600"><strong>Email:</strong> {customerEmail}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TermsAndConditionsModal
                isOpen={true}
                membershipName={membership.Name}
                email={customerEmail}
                includedFeatures={includedFeatures}
                priceLabel={`$${formatMoney(plan.totalPrice)} ${intervalLabel}`}
                onAccept={handleTermsAccept}
                onCancel={handleTermsCancel}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
