export type LostFoundItemType = 'lost' | 'found';
export type LostFoundStatus = 'open' | 'claimed' | 'resolved';

export type LostFoundItem = {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  location: string | null;
  itemType: LostFoundItemType;
  status: LostFoundStatus;
  itemDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
