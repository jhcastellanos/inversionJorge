'use client';

export default function DeleteMembershipButton({ membershipId, membershipName }: { membershipId: number; membershipName: string }) {
  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar la membresía "${membershipName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/memberships/${membershipId}/delete`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        window.location.reload();
      } else {
        alert(data.error || 'Error al eliminar la membresía');
      }
    } catch (error) {
      alert('Error al eliminar la membresía');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="w-full bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
    >
      Eliminar
    </button>
  );
}
