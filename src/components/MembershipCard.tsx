'use client';

import { useState } from 'react';
import TermsAndConditionsModal from './TermsAndConditionsModal';

interface MembershipCardProps {
  membership: {
    Id: number;
    Name: string;
    Description: string;
    MonthlyPrice: number;
    Benefits: string;
    ImageUrl?: string | null;
    DiscountPrice?: number | null;
    DiscountMonths?: number | null;
  };
}

export default function MembershipCard({ membership }: MembershipCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Mostrar modal de términos
    setShowPaymentForm(false);
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    try {
      setIsLoading(true);
      
      // Just validate terms acceptance, don't generate PDF yet
      const termsResponse = await fetch('/api/memberships/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          membershipName: membership.Name,
        }),
      });

      if (!termsResponse.ok) {
        throw new Error('Error al procesar los términos');
      }

      // Proceed to Stripe checkout (PDF will be generated after payment)
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
    // Volver a mostrar el formulario de pago
    setShowPaymentForm(true);
  };

  const benefits = membership.Benefits?.split('\n').filter(b => b.trim()) || [];

  return (
    <>
      <div className="group bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-indigo-200">
        {/* Imagen de la Membresía */}
        {membership.ImageUrl && (
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
            <img 
              src={membership.ImageUrl} 
              alt={membership.Name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Badge de Membresía */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="font-bold uppercase text-sm tracking-wide">Membresía</span>
          </div>
        </div>

        <div className="p-6">
          {/* Nombre */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center group-hover:text-indigo-600 transition-colors">
            {membership.Name}
          </h3>

          {/* Descripción */}
          <div className="mb-4">
            <p className={`text-gray-600 text-center ${!showFullDescription ? 'line-clamp-3' : ''}`}>
              {membership.Description}
            </p>
            {membership.Description && membership.Description.length > 120 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-1 font-medium"
              >
                {showFullDescription ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>

          {/* Precio con indicador de recurrencia */}
          <div className="bg-white rounded-xl p-4 mb-4 border-2 border-indigo-100">
            <div className="text-center">
              {membership.DiscountPrice && membership.DiscountMonths ? (
                <>
                  {/* Precio con descuento */}
                  <div className="mb-2">
                    <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                      ¡OFERTA! Primeros {membership.DiscountMonths} meses
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400 line-through">
                      ${parseFloat(membership.MonthlyPrice.toString()).toFixed(2)}
                    </span>
                    <span className="text-4xl font-bold text-green-600">
                      ${parseFloat(membership.DiscountPrice.toString()).toFixed(2)}
                    </span>
                    <span className="text-gray-600 text-lg">/mes</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Los primeros {membership.DiscountMonths} meses</p>
                  <p className="text-xs text-gray-400">
                    Luego ${parseFloat(membership.MonthlyPrice.toString()).toFixed(2)}/mes
                  </p>
                </>
              ) : (
                <>
                  {/* Precio normal */}
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${parseFloat(membership.MonthlyPrice.toString()).toFixed(2)}
                    </span>
                    <span className="text-gray-600 text-lg">/mes</span>
                  </div>
                  <p className="text-sm text-gray-500">Pago recurrente mensual</p>
                </>
              )}
            </div>
          </div>

          {/* Beneficios */}
          {benefits.length > 0 && (
            <div className="mb-4 bg-white rounded-xl p-4 border border-indigo-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Beneficios incluidos
              </h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Información importante:</p>
                <ul className="space-y-1">
                  <li>• Puedes cancelar en cualquier momento desde tu panel</li>
                  <li>• Acceso inmediato a todo el contenido tras la suscripción</li>
                  <li>• Mantienes acceso hasta el final del período pagado</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón de suscripción */}
          <button 
            onClick={handleSubscribeClick}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Suscribirme Ahora
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            Procesado de forma segura por Stripe
          </p>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && !showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Completar Compra</h2>
              <p className="text-gray-600 mt-1">{membership.Name}</p>
            </div>

            {/* Form */}
            <div className="p-6">
              {/* Resumen del Plan */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Precio:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${membership.DiscountPrice 
                      ? parseFloat(membership.DiscountPrice.toString()).toFixed(2)
                      : parseFloat(membership.MonthlyPrice.toString()).toFixed(2)
                    }/mes
                  </span>
                </div>
              </div>

              {/* Información del Cliente */}
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

              {/* Buttons */}
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
                  Comprar
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
            {/* Header */}
            <div className="border-b p-6 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
              <p className="text-gray-600 mt-1">Trading en Vivo con Jorge y Guille</p>
              <div className="mt-3 pt-3 border-t space-y-1">
                <p className="text-sm text-gray-600"><strong>Nombre:</strong> {customerName}</p>
                <p className="text-sm text-gray-600"><strong>Email:</strong> {customerEmail}</p>
              </div>
            </div>

            {/* Terms Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <TermsAndConditionsModal
                isOpen={true}
                membershipName={membership.Name}
                email={customerEmail}
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

