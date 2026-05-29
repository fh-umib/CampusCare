import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { getApiErrorMessage } from '../services/apiClient';
import { skillService } from '../services/skillService';
import type { Skill, SkillAvailability, SkillLevel, StudentSkill, StudentSkillCard } from '../types/skill';

const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];
const availabilityValues: SkillAvailability[] = ['available', 'busy', 'open_to_projects'];

export default function SkillMapPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [students, setStudents] = useState<StudentSkillCard[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });
  const [attachForm, setAttachForm] = useState({
    skillId: '',
    level: 'beginner' as SkillLevel,
    availability: 'available' as SkillAvailability
  });
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData(skillFilter = search) {
    setError('');
    try {
      setIsLoading(true);
      const [skillsData, mySkillsData, studentsData] = await Promise.all([
        skillService.list(),
        skillService.getMySkills(),
        skillService.students(skillFilter)
      ]);
      setSkills(skillsData);
      setMySkills(mySkillsData);
      setStudents(studentsData);
      if (!attachForm.skillId && skillsData[0]) {
        setAttachForm((current) => ({ ...current, skillId: skillsData[0].id }));
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddSkill(event: FormEvent) {
    event.preventDefault();
    if (!newSkill.name.trim()) {
      setError('Skill name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await skillService.create({ name: newSkill.name, category: newSkill.category || undefined });
      setNewSkill({ name: '', category: '' });
      setMessage('Skill saved.');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAttach(event: FormEvent) {
    event.preventDefault();
    if (!attachForm.skillId) {
      setError('Choose a skill to attach.');
      return;
    }

    try {
      setIsSubmitting(true);
      await skillService.attachMySkill(attachForm);
      setMessage('Skill attached to your profile.');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(skillId: string) {
    try {
      await skillService.removeMySkill(skillId);
      setMessage('Skill removed.');
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await loadData(search);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="SkillMap" description="Discover student skills and manage your own skill profile." />
      {message ? <div className="alert-success">{message}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <form className="panel space-y-4" onSubmit={handleAddSkill}>
          <h2 className="section-title">Add Skill</h2>
          <label className="block">
            <span className="field-label">Skill name</span>
            <input className="input" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} />
          </label>
          <label className="block">
            <span className="field-label">Category</span>
            <input className="input" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} />
          </label>
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            Save skill
          </button>
        </form>

        <form className="panel space-y-4" onSubmit={handleAttach}>
          <h2 className="section-title">Attach Skill To My Profile</h2>
          <label className="block">
            <span className="field-label">Skill</span>
            <select className="input" value={attachForm.skillId} onChange={(e) => setAttachForm({ ...attachForm, skillId: e.target.value })}>
              <option value="">Choose skill</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="field-label">Level</span>
              <select className="input" value={attachForm.level} onChange={(e) => setAttachForm({ ...attachForm, level: e.target.value as SkillLevel })}>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Availability</span>
              <select className="input" value={attachForm.availability} onChange={(e) => setAttachForm({ ...attachForm, availability: e.target.value as SkillAvailability })}>
                {availabilityValues.map((availability) => (
                  <option key={availability} value={availability}>
                    {availability.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            Attach skill
          </button>
        </form>
      </section>

      <section className="panel">
        <h2 className="section-title">My Skills</h2>
        {mySkills.length === 0 ? (
          <p className="empty-text mt-3">No skills attached yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mySkills.map((skill) => (
              <div key={skill.skillId} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <div>
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-sm text-slate-500">
                    {skill.level} · {skill.availability.replace('_', ' ')}
                  </p>
                </div>
                <button className="btn-danger" type="button" onClick={() => void handleRemove(skill.skillId)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Student Skill Cards</h2>
          <form className="flex gap-2" onSubmit={handleSearch}>
            <input className="input" placeholder="Search skill" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn-secondary" type="submit">
              Search
            </button>
          </form>
        </div>
        {isLoading ? <p className="empty-text mt-3">Loading skills...</p> : null}
        {!isLoading && students.length === 0 ? <p className="empty-text mt-3">No student skills found.</p> : null}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {students.map((student) => (
            <article key={student.userId} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{student.fullName}</p>
                  <p className="text-sm capitalize text-slate-500">{student.role}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {student.skills.map((skill) => (
                  <span key={skill.id} className="badge">
                    {skill.name} · {skill.level}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
