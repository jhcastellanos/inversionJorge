import Link from 'next/link';
import MemberAuthForm from '../../components/platform/MemberAuthForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6">
        <Link href="/" className="font-bold text-blue-900">
          ← Inversión Real con Jorge y Guille
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-600 mb-6">
            Después podrás elegir tu membresía y acceder a la plataforma.
          </p>
          <MemberAuthForm mode="register" />
        </div>
      </div>
    </div>
  );
}
