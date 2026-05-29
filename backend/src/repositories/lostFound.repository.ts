import { queryDatabase } from '../config/database.js';
import type { LostFoundItemType, LostFoundStatus } from '../types/lostFound.js';

type LostFoundRow = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  location: string | null;
  item_type: LostFoundItemType;
  status: LostFoundStatus;
  item_date: Date | null;
  created_at: Date;
  updated_at: Date;
  reporter_name: string | null;
};

function mapLostFound(row: LostFoundRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    location: row.location,
    itemType: row.item_type,
    status: row.status,
    itemDate: row.item_date,
    reporterName: row.reporter_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const lostFoundRepository = {
  findAll: async (filters: { itemType?: LostFoundItemType; status?: LostFoundStatus }) => {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.itemType) {
      params.push(filters.itemType);
      conditions.push(`lfi.item_type = $${params.length}`);
    }

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`lfi.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await queryDatabase<LostFoundRow>(
      `SELECT lfi.*, u.full_name AS reporter_name
       FROM lost_found_items lfi
       LEFT JOIN users u ON u.id = lfi.user_id
       ${where}
       ORDER BY lfi.created_at DESC`,
      params
    );

    return result.rows.map(mapLostFound);
  },

  findById: async (id: string) => {
    const result = await queryDatabase<LostFoundRow>(
      `SELECT lfi.*, u.full_name AS reporter_name
       FROM lost_found_items lfi
       LEFT JOIN users u ON u.id = lfi.user_id
       WHERE lfi.id = $1`,
      [id]
    );

    return result.rows[0] ? mapLostFound(result.rows[0]) : null;
  },

  create: async (input: {
    userId: string;
    title: string;
    description: string;
    location: string | null;
    itemType: LostFoundItemType;
    itemDate: string | null;
  }) => {
    const result = await queryDatabase<LostFoundRow>(
      `INSERT INTO lost_found_items (user_id, title, description, location, item_type, item_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *, NULL::text AS reporter_name`,
      [input.userId, input.title, input.description, input.location, input.itemType, input.itemDate]
    );

    return mapLostFound(result.rows[0]);
  },

  updateStatus: async (id: string, status: LostFoundStatus) => {
    const result = await queryDatabase<LostFoundRow>(
      `UPDATE lost_found_items
       SET status = $2
       WHERE id = $1
       RETURNING *, NULL::text AS reporter_name`,
      [id, status]
    );

    return result.rows[0] ? mapLostFound(result.rows[0]) : null;
  }
};
