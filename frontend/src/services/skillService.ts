import { apiClient, type ApiResponse } from './apiClient';
import type { Skill, SkillAvailability, SkillLevel, StudentSkill, StudentSkillCard } from '../types/skill';

export const skillService = {
  async list() {
    const response = await apiClient.get<ApiResponse<Skill[]>>('/skills');
    return response.data.data;
  },

  async create(payload: { name: string; category?: string }) {
    const response = await apiClient.post<ApiResponse<Skill>>('/skills', payload);
    return response.data.data;
  },

  async students(skill?: string) {
    const response = await apiClient.get<ApiResponse<StudentSkillCard[]>>('/skills/students', {
      params: skill ? { skill } : undefined
    });
    return response.data.data;
  },

  async getMySkills() {
    const response = await apiClient.get<ApiResponse<StudentSkill[]>>('/skills/my-skills');
    return response.data.data;
  },

  async attachMySkill(payload: { skillId: string; level: SkillLevel; availability: SkillAvailability }) {
    const response = await apiClient.post<ApiResponse<StudentSkill>>('/skills/my-skills', payload);
    return response.data.data;
  },

  async removeMySkill(skillId: string) {
    const response = await apiClient.delete<ApiResponse<{ skillId: string }>>(`/skills/my-skills/${skillId}`);
    return response.data.data;
  }
};

