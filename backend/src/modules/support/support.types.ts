import type { UserRole } from '../../types/roles.js';

export type SupportStatus = 'open' | 'closed';
export type SupportParticipantRole = 'student' | 'mentor';
export type SupportConversation = {
  id: string; helpRequestId: string; title: string; category: string; isAnonymous: boolean;
  status: SupportStatus; mentorUserId: string | null; participantLabel: string;
  unreadCount: number; createdAt: Date; updatedAt: Date; closedAt: Date | null;
};
export type SupportMessage = { id: string; conversationId: string; sender: { role: SupportParticipantRole; displayName: string }; message: string; createdAt: Date };
export type SupportActor = { id: string; role: UserRole; fullName: string };
