import { helpRequestRepository } from '../repositories/helpRequest.repository.js';
import type { HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';
import { optionalEnum, requireCurrentUser, requireEnum, requireString } from '../utils/moduleValidation.js';

const helpCategories = [
  'subject',
  'project',
  'github',
  'programming',
  'academic_stress',
  'teamwork',
  'other'
] as const satisfies readonly HelpRequestCategory[];

const helpStatuses = ['open', 'answered', 'closed'] as const satisfies readonly HelpRequestStatus[];

export const helpRequestService = {
  list: (query: Record<string, unknown>) => {
    return helpRequestRepository.findAll({
      status: optionalEnum(query.status, helpStatuses, 'status'),
      category: optionalEnum(query.category, helpCategories, 'category')
    });
  },

  getById: async (id: string) => {
    const helpRequest = await helpRequestRepository.findById(id);

    if (!helpRequest) {
      throw new AppError(404, 'Help request not found');
    }

    return helpRequest;
  },

  create: (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    return helpRequestRepository.create({
      userId: user.id,
      title: requireString(data.title, 'title', 150),
      category: requireEnum(data.category, helpCategories, 'category'),
      description: requireString(data.description, 'description'),
      isAnonymous: data.isAnonymous === undefined ? true : Boolean(data.isAnonymous)
    });
  },

  reply: async (id: string, payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    await helpRequestService.getById(id);

    return helpRequestRepository.createReply({
      helpRequestId: id,
      userId: user.id,
      message: requireString((payload as Record<string, unknown>).message, 'message')
    });
  },

  updateStatus: async (id: string, payload: unknown) => {
    const status = requireEnum((payload as Record<string, unknown>).status, helpStatuses, 'status');
    const updated = await helpRequestRepository.updateStatus(id, status);

    if (!updated) {
      throw new AppError(404, 'Help request not found');
    }

    return updated;
  }
};
