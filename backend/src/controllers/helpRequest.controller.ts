import type { Request, Response } from 'express';
import { helpRequestService } from '../services/helpRequest.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const helpRequestController = {
  ready: async (_request: Request, response: Response) => {
    const data = await helpRequestService.ready();
    successResponse(response, 'Help Requests module is ready', data);
  }
};
