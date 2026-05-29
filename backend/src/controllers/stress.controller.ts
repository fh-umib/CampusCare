import type { Request, Response } from 'express';
import { stressService } from '../services/stress.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const stressController = {
  list: async (request: Request, response: Response) => {
    const data = await stressService.list(request.currentUser);
    successResponse(response, 'Stress records retrieved', data);
  },

  create: async (request: Request, response: Response) => {
    const data = await stressService.create(request.body, request.currentUser);
    successResponse(response, 'Stress record created', data, 201);
  },

  summary: async (request: Request, response: Response) => {
    const data = await stressService.summary(request.currentUser);
    successResponse(response, 'Stress summary retrieved', data);
  }
};
