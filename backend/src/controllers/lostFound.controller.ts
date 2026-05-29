import type { Request, Response } from 'express';
import { lostFoundService } from '../services/lostFound.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const lostFoundController = {
  list: async (request: Request, response: Response) => {
    const data = await lostFoundService.list(request.query);
    successResponse(response, 'Lost and found items retrieved', data);
  },

  getById: async (request: Request, response: Response) => {
    const data = await lostFoundService.getById(request.params.id);
    successResponse(response, 'Lost and found item retrieved', data);
  },

  create: async (request: Request, response: Response) => {
    const data = await lostFoundService.create(request.body, request.currentUser);
    successResponse(response, 'Lost and found report created', data, 201);
  },

  updateStatus: async (request: Request, response: Response) => {
    const data = await lostFoundService.updateStatus(request.params.id, request.body, request.currentUser);
    successResponse(response, 'Lost and found status updated', data);
  }
};
