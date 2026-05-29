import { lostFoundRepository } from '../repositories/lostFound.repository.js';
import type { LostFoundItemType, LostFoundStatus } from '../types/lostFound.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';
import {
  optionalEnum,
  optionalString,
  requireCurrentUser,
  requireEnum,
  requireString
} from '../utils/moduleValidation.js';

const itemTypes = ['lost', 'found'] as const satisfies readonly LostFoundItemType[];
const itemStatuses = ['open', 'claimed', 'resolved'] as const satisfies readonly LostFoundStatus[];

function optionalDateString(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new AppError(400, 'item_date must be a valid date string');
  }

  return value;
}

export const lostFoundService = {
  list: (query: Record<string, unknown>) => {
    return lostFoundRepository.findAll({
      itemType: optionalEnum(query.item_type ?? query.itemType, itemTypes, 'item_type'),
      status: optionalEnum(query.status, itemStatuses, 'status')
    });
  },

  getById: async (id: string) => {
    const item = await lostFoundRepository.findById(id);

    if (!item) {
      throw new AppError(404, 'Lost or found item not found');
    }

    return item;
  },

  create: (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    return lostFoundRepository.create({
      userId: user.id,
      title: requireString(data.title, 'title', 120),
      description: requireString(data.description, 'description'),
      location: optionalString(data.location, 'location', 120),
      itemType: requireEnum(data.item_type ?? data.itemType, itemTypes, 'item_type'),
      itemDate: optionalDateString(data.item_date ?? data.itemDate)
    });
  },

  updateStatus: async (id: string, payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const item = await lostFoundService.getById(id);

    if (user.role !== 'admin' && item.userId !== user.id) {
      throw new AppError(403, 'You do not have permission to perform this action.');
    }

    const status = requireEnum((payload as Record<string, unknown>).status, itemStatuses, 'status');
    const updated = await lostFoundRepository.updateStatus(id, status);

    if (!updated) {
      throw new AppError(404, 'Lost or found item not found');
    }

    return updated;
  }
};
