import type { Request, Response } from 'express';
import { skillService } from '../services/skill.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const skillController = {
  ready: async (_request: Request, response: Response) => {
    const data = await skillService.ready();
    successResponse(response, 'Skills module is ready', data);
  }
};
