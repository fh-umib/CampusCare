export type HelpRequestCategory =
  | 'subject'
  | 'project'
  | 'github'
  | 'programming'
  | 'academic_stress'
  | 'teamwork'
  | 'other';

export type HelpRequestStatus = 'open' | 'answered' | 'closed';

export type HelpRequest = {
  id: string;
  userId: string | null;
  category: HelpRequestCategory;
  title: string;
  description: string;
  isAnonymous: boolean;
  status: HelpRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type HelpReply = {
  id: string;
  helpRequestId: string;
  userId: string | null;
  message: string;
  createdAt: Date;
};
