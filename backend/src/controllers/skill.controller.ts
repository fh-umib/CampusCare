import type { Request, Response } from 'express';
import { skillService } from '../services/skill.service.js';

export const skillController = {
  search: async (request: Request, response: Response) => {
    response.json(await skillService.search(String(request.query.skill ?? '')));
  },

  addSkill: async (request: Request, response: Response) => {
    response.status(201).json(await skillService.addSkill(request.body));
  }
};

