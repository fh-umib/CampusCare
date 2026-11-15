import {access} from 'node:fs/promises';
import path from 'node:path';

export const requiredCampusCareAssets = [
  'landing.png',
  'student-dashboard.png',
  'silent-help.png',
  'exam-stress.png',
  'mood-campus.png',
  'skill-map.png',
  'ai-study-assistant.png',
  'events-list.png',
  'team-workspace.png',
  'lost-found.png',
  'mentor-dashboard.png',
  'mentor-support.png',
  'admin-dashboard.png',
  'admin-users.png',
  'audit-logs.png',
  'admin-security.png',
  'campuscare-qr.png',
] as const;

const missing: string[] = [];

for (const asset of requiredCampusCareAssets) {
  const relativePath = path.join('public', 'captures', asset);
  try {
    await access(path.resolve(relativePath));
  } catch {
    missing.push(relativePath.replaceAll('\\', '/'));
  }
}

if (missing.length) {
  throw new Error(`Missing CampusCare video asset${missing.length === 1 ? '' : 's'}:\n${missing.join('\n')}\nRun npm run video:capture before previewing or rendering.`);
}

console.log(`Verified ${requiredCampusCareAssets.length} CampusCare video assets in public/captures/.`);
