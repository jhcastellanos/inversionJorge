'use client';

import { useState } from 'react';
import CourseCard from './CourseCard';
import MembershipCard from './MembershipCard';
import { getMonthlyBasePrice, sortMembershipsByPlanOrder } from '../lib/membershipPlans';

export default function ResponsiveLanding({
  courses,
  memberships,
  variant = 'landing',
  stickyOffset = 73,
}: {
  courses: any[];
  memberships: any[];
  variant?: 'landing' | 'ventic';
  stickyOffset?: number;
}) {
  const [activeTab, setActiveTab] = useState<'memberships' | 'courses'>('memberships');
  const monthlyBasePrice = getMonthlyBasePrice(memberships);
  const orderedMemberships = sortMembershipsByPlanOrder(memberships);
  const isVentic = variant === 'ventic';
  const headingClass = isVentic ? 'ventic-text' : 'text-gray-900';
  const subClass = isVentic ? 'ventic-muted' : 'text-gray-600';
  const emptyWrap = isVentic
    ? 'rounded-2xl border ventic-border ventic-surface p-10 text-center'
    : 'rounded-2xl bg-white p-10 text-center shadow-sm';
  const emptyText = isVentic ? 'ventic-muted' : 'text-gray-500';

  // Al cambiar de sección volvemos al inicio para no quedar a mitad del scroll.
  const handleTabChange = (tab: 'memberships' | 'courses') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Banda del selector: a todo el ancho y opaca para que el contenido
          desaparezca por completo al hacer scroll por debajo (sin efecto "bug"). */}
      <div
        className={
          isVentic
            ? 'sticky z-30 border-b ventic-border ventic-surface py-3 mb-2'
            : 'sticky z-40 border-b border-slate-200 bg-slate-100 shadow-sm'
        }
        style={isVentic ? { top: stickyOffset } : { top: stickyOffset }}
      >
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${isVentic ? '' : 'py-3'}`}>
          <div
            className={`mx-auto flex max-w-xl gap-2 rounded-2xl p-2 ${
              isVentic
                ? 'border ventic-border bg-ventic-accent-soft/30'
                : 'border-2 border-blue-200 bg-white shadow-md'
            }`}
          >
            <button
              onClick={() => handleTabChange('memberships')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
              activeTab === 'memberships'
                ? isVentic
                  ? 'bg-[var(--ventic-accent)] text-white shadow-sm'
                  : 'bg-gradient-to-br from-blue-900 to-blue-700 text-white shadow-lg'
                : isVentic
                  ? 'ventic-muted hover:bg-ventic-accent-soft hover:ventic-text'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>Membresías</span>
            {memberships.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === 'memberships'
                    ? 'bg-white/30 text-white'
                    : isVentic
                      ? 'bg-ventic-accent-soft text-[var(--ventic-accent)]'
                      : 'bg-blue-100 text-blue-900'
                }`}
              >
                {memberships.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('courses')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all duration-300 ${
              activeTab === 'courses'
                ? isVentic
                  ? 'bg-[var(--ventic-accent)] text-white shadow-sm'
                  : 'bg-gradient-to-br from-blue-900 to-blue-700 text-white shadow-lg'
                : isVentic
                  ? 'ventic-muted hover:bg-ventic-accent-soft hover:ventic-text'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Cursos y Clases</span>
            {courses.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === 'courses'
                    ? 'bg-white/30 text-white'
                    : isVentic
                      ? 'bg-ventic-accent-soft text-[var(--ventic-accent)]'
                      : 'bg-blue-100 text-blue-900'
                }`}
              >
                {courses.length}
              </span>
            )}
          </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Sección: Membresías */}
      {activeTab === 'memberships' && (
        <section className="animate-fadeIn">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className={`text-3xl font-extrabold sm:text-4xl ${headingClass}`}>Membresías Exclusivas</h2>
            <p className={`mt-3 ${subClass}`}>
              Elige el plan que mejor se adapta a ti. Mientras más largo, más ahorras.
            </p>
          </div>

          {orderedMemberships.length === 0 ? (
            <div className={emptyWrap}>
              <p className={emptyText}>No hay membresías disponibles</p>
            </div>
          ) : (
            <>
              <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
                {orderedMemberships.map((membership: any) => (
                  <MembershipCard
                    key={membership.Id}
                    membership={membership}
                    monthlyBasePrice={monthlyBasePrice}
                    accent={isVentic ? 'ventic' : 'blue'}
                  />
                ))}
              </div>
              <p className={`mx-auto mt-8 max-w-2xl text-center text-sm ${subClass}`}>
                Todos los pagos son recurrentes y <strong>no reembolsables</strong>. Elige bien tu plan
                antes de suscribirte.
              </p>
            </>
          )}
        </section>
      )}

      {/* Sección: Cursos y Clases Grabadas */}
      {activeTab === 'courses' && (
        <section className="animate-fadeIn">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className={`text-3xl font-extrabold sm:text-4xl ${headingClass}`}>Cursos y Clases Grabadas</h2>
            <p className={`mt-3 ${subClass}`}>Pago único · Acceso de por vida al contenido.</p>
          </div>

          {courses.length === 0 ? (
            <div className={emptyWrap}>
              <p className={emptyText}>No hay cursos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {courses.map((course: any) => (
                <CourseCard key={course.Id} course={course} />
              ))}
            </div>
          )}
        </section>
      )}
      </div>
    </>
  );
}
