export type HelpRequestCategory =
  | 'subject'
  | 'project'
  | 'github'
  | 'programming'
  | 'academic_stress'
  | 'teamwork'
  | 'other';

export type HelpRequestStatus = 'open' | 'answered' | 'closed';

export type HelpReply = {
  id: string;
  helpRequestId: string;
  userId: string | null;
  message: string;
  replierName: string;
  replierRole: string | null;
  createdAt: string;
};

export type HelpRequest = {
  id: string;
  userId: string | null;
  category: HelpRequestCategory;
  title: string;
  description: string;
  isAnonymous: boolean;
  status: HelpRequestStatus;
  studentName: string;
  createdAt: string;
  updatedAt: string;
  replies?: HelpReply[];
};

export type CreateHelpRequestPayload = {
  title: string;
  category: HelpRequestCategory;
  description: string;
  isAnonymous: boolean;
};

