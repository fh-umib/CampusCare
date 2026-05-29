export type LostFoundStatus = 'lost' | 'found' | 'returned';

export type LostFoundItem = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  status: LostFoundStatus;
};

