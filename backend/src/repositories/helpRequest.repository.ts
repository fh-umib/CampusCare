import { queryDatabase } from '../config/database.js';
import type { HelpRequestCategory, HelpRequestStatus } from '../types/helpRequest.js';

type HelpRequestRow = {
  id: string;
  user_id: string | null;
  title: string;
  category: HelpRequestCategory;
  description: string;
  is_anonymous: boolean;
  status: HelpRequestStatus;
  created_at: Date;
  updated_at: Date;
  student_name: string | null;
};

type HelpReplyRow = {
  id: string;
  help_request_id: string;
  user_id: string | null;
  message: string;
  created_at: Date;
  replier_name: string | null;
  replier_role: string | null;
};

function mapHelpRequest(row: HelpRequestRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    description: row.description,
    isAnonymous: row.is_anonymous,
    status: row.status,
    studentName: row.is_anonymous ? 'Anonymous Student' : (row.student_name ?? 'Unknown Student'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapHelpReply(row: HelpReplyRow) {
  return {
    id: row.id,
    helpRequestId: row.help_request_id,
    userId: row.user_id,
    message: row.message,
    replierName: row.replier_name ?? 'Unknown User',
    replierRole: row.replier_role,
    createdAt: row.created_at
  };
}

export const helpRequestRepository = {
  findAll: async (filters: { status?: HelpRequestStatus; category?: HelpRequestCategory }) => {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`hr.status = $${params.length}`);
    }

    if (filters.category) {
      params.push(filters.category);
      conditions.push(`hr.category = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await queryDatabase<HelpRequestRow>(
      `SELECT hr.*, u.full_name AS student_name
       FROM help_requests hr
       LEFT JOIN users u ON u.id = hr.user_id
       ${where}
       ORDER BY hr.created_at DESC`,
      params
    );

    return result.rows.map(mapHelpRequest);
  },

  findById: async (id: string) => {
    const requestResult = await queryDatabase<HelpRequestRow>(
      `SELECT hr.*, u.full_name AS student_name
       FROM help_requests hr
       LEFT JOIN users u ON u.id = hr.user_id
       WHERE hr.id = $1`,
      [id]
    );

    const request = requestResult.rows[0];

    if (!request) {
      return null;
    }

    const repliesResult = await queryDatabase<HelpReplyRow>(
      `SELECT hp.*, u.full_name AS replier_name, u.role AS replier_role
       FROM help_replies hp
       LEFT JOIN users u ON u.id = hp.user_id
       WHERE hp.help_request_id = $1
       ORDER BY hp.created_at ASC`,
      [id]
    );

    return {
      ...mapHelpRequest(request),
      replies: repliesResult.rows.map(mapHelpReply)
    };
  },

  create: async (input: {
    userId: string;
    title: string;
    category: HelpRequestCategory;
    description: string;
    isAnonymous: boolean;
  }) => {
    const result = await queryDatabase<HelpRequestRow>(
      `INSERT INTO help_requests (user_id, title, category, description, is_anonymous)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, NULL::text AS student_name`,
      [input.userId, input.title, input.category, input.description, input.isAnonymous]
    );

    return mapHelpRequest(result.rows[0]);
  },

  createReply: async (input: { helpRequestId: string; userId: string; message: string }) => {
    const result = await queryDatabase<HelpReplyRow>(
      `INSERT INTO help_replies (help_request_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING *, NULL::text AS replier_name, NULL::text AS replier_role`,
      [input.helpRequestId, input.userId, input.message]
    );

    await queryDatabase(
      `UPDATE help_requests
       SET status = 'answered'
       WHERE id = $1 AND status = 'open'`,
      [input.helpRequestId]
    );

    return mapHelpReply(result.rows[0]);
  },

  updateStatus: async (id: string, status: HelpRequestStatus) => {
    const result = await queryDatabase<HelpRequestRow>(
      `UPDATE help_requests
       SET status = $2
       WHERE id = $1
       RETURNING *, NULL::text AS student_name`,
      [id, status]
    );

    return result.rows[0] ? mapHelpRequest(result.rows[0]) : null;
  }
};
