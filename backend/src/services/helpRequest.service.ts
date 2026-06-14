import { helpRequestRepository } from '../repositories/helpRequest.repository.js';
import { notificationService } from './notification.service.js';
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

  create: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = payload as Record<string, unknown>;

    const created = await helpRequestRepository.create({
      userId: user.id,
      title: requireString(data.title, 'title', 150),
      category: requireEnum(data.category, helpCategories, 'category'),
      description: requireString(data.description, 'description'),
      isAnonymous: data.isAnonymous === undefined ? true : Boolean(data.isAnonymous)
    });
    await Promise.all([
      notificationService.create({
        role: 'mentor',
        type: 'help_request',
        title: 'New support request',
        message: `${created.title} is waiting in the Silent Help queue.`,
        link: '/silent-help'
      }),
      notificationService.create({
        role: 'admin',
        type: 'help_request',
        title: 'New support activity',
        message: `A new ${created.category.replace(/_/g, ' ')} request was added to Silent Help.`,
        link: '/silent-help'
      })
    ]);
    return created;
  },

  reply: async (id: string, payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const helpRequest = await helpRequestService.getById(id);
    const reply = await helpRequestRepository.createReply({
      helpRequestId: id,
      userId: user.id,
      message: requireString((payload as Record<string, unknown>).message, 'message')
    });
    if (helpRequest.userId && helpRequest.userId !== user.id) {
      await notificationService.create({
        userId: helpRequest.userId,
        type: 'reply',
        title: 'New reply to your request',
        message: `Someone replied to “${helpRequest.title}”.`,
        link: '/silent-help'
      });
    }
    return reply;
  },

  updateStatus: async (id: string, payload: unknown) => {
    const helpRequest = await helpRequestService.getById(id);
    const status = requireEnum((payload as Record<string, unknown>).status, helpStatuses, 'status');
    const updated = await helpRequestRepository.updateStatus(id, status);

    if (!updated) {
      throw new AppError(404, 'Help request not found');
    }

    if (helpRequest.userId) {
      await notificationService.create({
        userId: helpRequest.userId,
        type: 'help_request',
        title: 'Help request status updated',
        message: `“${helpRequest.title}” is now ${status}.`,
        link: '/silent-help'
      });
    }
    return updated;
  }
};
