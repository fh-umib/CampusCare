export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type SkillAvailability = 'available' | 'busy' | 'open_to_projects';

export type Skill = {
  id: string;
  name: string;
  category: string | null;
  createdAt: Date;
};

export type StudentSkill = {
  id: string;
  userId: string;
  skillId: string;
  name: string;
  category: string | null;
  level: SkillLevel;
  availability: SkillAvailability;
  createdAt: Date;
};
