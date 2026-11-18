export type SupportTicketStatus = 'open' | 'read' | 'answered' | 'closed';

export type SupportTicketRow = {
  id: number;
  user_id: number;
  title: string | null;
  body: string;
  is_anonymous: boolean;
  status: SupportTicketStatus;
  admin_response: string | null;
  read_at: string | null;
  answered_at: string | null;
  answered_by_user_id: number | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicketWithUser = SupportTicketRow & {
  user_email: string;
  user_full_name: string;
};

export function memberTicketStatusLabel(status: SupportTicketStatus): string {
  switch (status) {
    case 'open':
      return 'Enviado';
    case 'read':
      return 'Leído';
    case 'answered':
      return 'Respondido';
    case 'closed':
      return 'Cerrado';
    default:
      return status;
  }
}