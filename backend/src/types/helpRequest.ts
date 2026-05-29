export type HelpRequestCategory = 'subject' | 'project' | 'github' | 'programming' | 'academic_stress';

export type HelpRequest = {
  id: string;
  category: HelpRequestCategory;
  title: string;
  description: string;
  isAnonymous: boolean;
  createdAt: Date;
};

