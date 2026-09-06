import { helpRequestRepository } from '../repositories/helpRequest.repository.js';
import { notificationService } from './notification.service.js';
import type { HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest.js';
import type { PublicUser } from '../types/user.js';
import { AppError } from '../utils/httpError.js';
import { optionalBoolean, optionalEnum, requireCurrentUser, requireEnum, requireObject, requireString, requireUuid } from '../utils/moduleValidation.js';
import { supportService } from '../modules/support/support.service.js';

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

async function authorizedRequest(id:string,user:PublicUser){requireUuid(id);const request=await helpRequestRepository.findById(id);if(!request)throw new AppError(404,'Help request not found');if(user.role==='student'&&request.userId!==user.id)throw new AppError(404,'Help request not found');return request}

export const helpRequestService = {
  list: async (query: Record<string, unknown>, currentUser: PublicUser | undefined) => {
    const user=requireCurrentUser(currentUser);
    const requests=await helpRequestRepository.findAll({
      status: optionalEnum(query.status, helpStatuses, 'status'),
      category: optionalEnum(query.category, helpCategories, 'category')
    });
    if(user.role==='student')return requests.filter(request=>request.userId===user.id);
    return requests.map(request=>request.isAnonymous?{...request,userId:null,studentName:'Anonymous Student'}:request);
  },

  getById: async (id: string, currentUser: PublicUser | undefined) => {
    const user=requireCurrentUser(currentUser);
    const helpRequest = await authorizedRequest(id,user);
    if(user.role==='admin')return{...helpRequest,userId:helpRequest.isAnonymous?null:helpRequest.userId,studentName:helpRequest.isAnonymous?'Anonymous Student':helpRequest.studentName,replies:[]};
    return user.role==='mentor'&&helpRequest.isAnonymous?{...helpRequest,userId:null,studentName:'Anonymous Student'}:helpRequest;
  },

  create: async (payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    const data = requireObject(payload);

    const created = await helpRequestRepository.create({
      userId: user.id,
      title: requireString(data.title, 'title', 150),
      category: requireEnum(data.category, helpCategories, 'category'),
      description: requireString(data.description, 'description'),
      isAnonymous: optionalBoolean(data.isAnonymous, 'isAnonymous', true)
    });
    await Promise.all([
      notificationService.create({
        role: 'mentor',
        type: 'help_request',
        title: 'New support request',
        message: `${created.title} is waiting in the Silent Help queue.`,
        link: `/silent-help?request=${created.id}`
      }),
      notificationService.create({
        role: 'admin',
        type: 'help_request',
        title: 'New support activity',
        message: `A new ${created.category.replace(/_/g, ' ')} request was added to Silent Help.`,
        link: `/silent-help?request=${created.id}`
      })
    ]);
    return created;
  },

  reply: async (id: string, payload: unknown, currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    if(user.role==='admin')throw new AppError(403,'Admin accounts cannot participate in private support conversations.');
    const helpRequest = await authorizedRequest(id,user);
    void helpRequest;
    return supportService.sendByHelpRequest(id,{message:requireString(requireObject(payload).message,'message',2000)},user);
  },

  updateStatus: async (id: string, payload: unknown, currentUser?:PublicUser) => {
    const user=requireCurrentUser(currentUser);
    const helpRequest = await authorizedRequest(id,user);
    const status = requireEnum(requireObject(payload).status, helpStatuses, 'status');
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
        link: `/silent-help?request=${helpRequest.id}`
      });
    }
    return updated;
  }
};
