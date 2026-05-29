import type { Request, Response } from 'express';
import { helpRequestService } from '../services/helpRequest.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const helpRequestController = {
  list: async (request: Request, response: Response) => {
    const data = await helpRequestService.list(request.query);
    successResponse(response, 'Help requests retrieved', data);
  },

  getById: async (request: Request, response: Response) => {
    const data = await helpRequestService.getById(request.params.id);
    successResponse(response, 'Help request retrieved', data);
  },

  create: async (request: Request, response: Response) => {
    const data = await helpRequestService.create(request.body, request.currentUser);
    successResponse(response, 'Help request created', data, 201);
  },

  reply: async (request: Request, response: Response) => {
    const data = await helpRequestService.reply(request.params.id, request.body, request.currentUser);
    successResponse(response, 'Reply added', data, 201);
  },

  updateStatus: async (request: Request, response: Response) => {
    const data = await helpRequestService.updateStatus(request.params.id, request.body);
    successResponse(response, 'Help request status updated', data);
  }
};
