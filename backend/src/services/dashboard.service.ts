import { dashboardRepository } from '../repositories/dashboard.repository.js';
import type { PublicUser } from '../types/user.js';
import { canViewGlobalRecords, requireCurrentUser } from '../utils/moduleValidation.js';

export const dashboardService = {
  stats: (currentUser: PublicUser | undefined) => {
    const user = requireCurrentUser(currentUser);
    return dashboardRepository.stats(canViewGlobalRecords(user.role) ? {} : { userId: user.id });
  }
};
