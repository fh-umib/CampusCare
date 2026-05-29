import { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/apiClient';
import { skillService } from '../services/skillService';
import type { StudentSkill } from '../types/skill';
import { formatDate } from '../utils/formatDate';

export default function ProfilePage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    skillService
      .getMySkills()
      .then(setSkills)
      .catch((err: unknown) => setError(getApiErrorMessage(err)));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your CampusCare account and skill profile." />
      {error ? <div className="alert-error">{error}</div> : null}
      <section className="panel grid gap-4 md:grid-cols-2">
        <div>
          <p className="field-label">Full name</p>
          <p className="font-medium">{user?.fullName}</p>
        </div>
        <div>
          <p className="field-label">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="field-label">Role</p>
          <p className="font-medium capitalize">{user?.role}</p>
        </div>
        <div>
          <p className="field-label">Created</p>
          <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'Not available'}</p>
        </div>
      </section>
      <section className="panel">
        <h2 className="section-title">My Skills</h2>
        {skills.length === 0 ? (
          <p className="empty-text">No skills attached yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.skillId} className="badge">
                {skill.name} - {skill.level}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
