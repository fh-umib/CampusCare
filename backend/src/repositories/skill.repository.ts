import { queryDatabase } from '../config/database.js';
import type { SkillAvailability, SkillLevel } from '../types/skill.js';
import type { UserRole } from '../types/roles.js';

type SkillRow = {
  id: string;
  name: string;
  category: string | null;
  created_at: Date;
};

type StudentSkillRow = {
  id: string;
  user_id: string;
  skill_id: string;
  name: string;
  category: string | null;
  level: SkillLevel;
  availability: SkillAvailability;
  created_at: Date;
};

type StudentCardRow = {
  user_id: string;
  full_name: string;
  role: UserRole;
  skill_id: string;
  skill_name: string;
  category: string | null;
  level: SkillLevel;
  availability: SkillAvailability;
};

function mapSkill(row: SkillRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    createdAt: row.created_at
  };
}

function mapStudentSkill(row: StudentSkillRow) {
  return {
    id: row.id,
    userId: row.user_id,
    skillId: row.skill_id,
    name: row.name,
    category: row.category,
    level: row.level,
    availability: row.availability,
    createdAt: row.created_at
  };
}

export const skillRepository = {
  findAll: async () => {
    const result = await queryDatabase<SkillRow>(
      `SELECT id, name, category, created_at
       FROM skills
       ORDER BY name ASC`
    );

    return result.rows.map(mapSkill);
  },

  create: async (input: { name: string; category: string | null }) => {
    const result = await queryDatabase<SkillRow>(
      `INSERT INTO skills (name, category)
       VALUES ($1, $2)
       ON CONFLICT (name)
       DO UPDATE SET category = COALESCE(EXCLUDED.category, skills.category)
       RETURNING id, name, category, created_at`,
      [input.name, input.category]
    );

    return mapSkill(result.rows[0]);
  },

  findById: async (id: string) => {
    const result = await queryDatabase<SkillRow>(
      `SELECT id, name, category, created_at
       FROM skills
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ? mapSkill(result.rows[0]) : null;
  },

  attachToUser: async (input: {
    userId: string;
    skillId: string;
    level: SkillLevel;
    availability: SkillAvailability;
  }) => {
    const result = await queryDatabase<StudentSkillRow>(
      `INSERT INTO student_skills (user_id, skill_id, level, availability)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, skill_id)
       DO UPDATE SET level = EXCLUDED.level, availability = EXCLUDED.availability
       RETURNING id, user_id, skill_id, level, availability, created_at,
         (SELECT name FROM skills WHERE id = student_skills.skill_id) AS name,
         (SELECT category FROM skills WHERE id = student_skills.skill_id) AS category`,
      [input.userId, input.skillId, input.level, input.availability]
    );

    return mapStudentSkill(result.rows[0]);
  },

  findUserSkills: async (userId: string) => {
    const result = await queryDatabase<StudentSkillRow>(
      `SELECT ss.id, ss.user_id, ss.skill_id, s.name, s.category, ss.level, ss.availability, ss.created_at
       FROM student_skills ss
       INNER JOIN skills s ON s.id = ss.skill_id
       WHERE ss.user_id = $1
       ORDER BY s.name ASC`,
      [userId]
    );

    return result.rows.map(mapStudentSkill);
  },

  removeFromUser: async (userId: string, skillId: string) => {
    const result = await queryDatabase(
      `DELETE FROM student_skills
       WHERE user_id = $1 AND skill_id = $2
       RETURNING id`,
      [userId, skillId]
    );

    return (result.rowCount ?? 0) > 0;
  },

  findStudentCards: async (skill?: string) => {
    const params: unknown[] = [];
    const where = skill ? 'WHERE LOWER(s.name) LIKE LOWER($1)' : '';

    if (skill) {
      params.push(`%${skill}%`);
    }

    const result = await queryDatabase<StudentCardRow>(
      `SELECT u.id AS user_id, u.full_name, u.role, s.id AS skill_id, s.name AS skill_name,
        s.category, ss.level, ss.availability
       FROM student_skills ss
       INNER JOIN users u ON u.id = ss.user_id
       INNER JOIN skills s ON s.id = ss.skill_id
       ${where}
       ORDER BY u.full_name ASC, s.name ASC`,
      params
    );

    const cards = new Map<string, { userId: string; fullName: string; role: UserRole; skills: unknown[] }>();

    for (const row of result.rows) {
      const card =
        cards.get(row.user_id) ??
        {
          userId: row.user_id,
          fullName: row.full_name,
          role: row.role,
          skills: []
        };

      card.skills.push({
        id: row.skill_id,
        name: row.skill_name,
        category: row.category,
        level: row.level,
        availability: row.availability
      });
      cards.set(row.user_id, card);
    }

    return Array.from(cards.values());
  }
};
