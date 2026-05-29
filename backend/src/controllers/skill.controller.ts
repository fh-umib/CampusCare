import type { Request, Response } from 'express';
import { skillService } from '../services/skill.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const skillController = {
  list: async (_request: Request, response: Response) => {
    const data = await skillService.list();
    successResponse(response, 'Skills retrieved', data);
  },

  create: async (request: Request, response: Response) => {
    const data = await skillService.create(request.body, request.currentUser);
    successResponse(response, 'Skill saved', data, 201);
  },

  students: async (request: Request, response: Response) => {
    const data = await skillService.getStudentCards(request.query);
    successResponse(response, 'Student skill cards retrieved', data);
  },

  attachMySkill: async (request: Request, response: Response) => {
    const data = await skillService.attachMySkill(request.body, request.currentUser);
    successResponse(response, 'Skill attached to profile', data, 201);
  },

  getMySkills: async (request: Request, response: Response) => {
    const data = await skillService.getMySkills(request.currentUser);
    successResponse(response, 'Current user skills retrieved', data);
  },

  removeMySkill: async (request: Request, response: Response) => {
    const data = await skillService.removeMySkill(request.params.skillId, request.currentUser);
    successResponse(response, 'Skill removed from profile', data);
  }
};
