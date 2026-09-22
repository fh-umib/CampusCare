import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../services/apiClient';
import { securityService, type ActivityItem } from '../../services/securityService';
import type { UserRole } from '../../types/roles';

const labels: Record<string, string> = { login_success: 'Signed in', profile_updated: 'Updated profile', support_request_created: 'Submitted a support request', support_request_assigned: 'Started supporting a request', support_request_status_changed: 'Changed a support request status', support_request_resolved: 'Resolved a support request', admin_2fa_enabled: 'Enabled two-factor authentication', admin_2fa_disabled: 'Disabled two-factor authentication', admin_2fa_verified: 'Verified admin sign-in' };

export function ProfileSecurityActivity({ role }: { role: UserRole }) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [setup, setSetup] = useState<{ qrCodeDataUrl: string; manualSecret: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { void securityService.activity().then((data) => setActivity(data.items)).catch((err) => setError(getApiErrorMessage(err))); if (role === 'admin') void securityService.twoFactorStatus().then((data) => setEnabled(data.enabled)).catch((err) => setError(getApiErrorMessage(err))); }, [role]);
  async function beginSetup() { try { setError(''); setSetup(await securityService.setupTwoFactor()); } catch (err) { setError(getApiErrorMessage(err)); } }
  async function confirmSetup() { try { await securityService.enableTwoFactor(code); setEnabled(true); setSetup(null); setCode(''); } catch (err) { setError(getApiErrorMessage(err)); } }
  async function disable() { try { await securityService.disableTwoFactor(code); setEnabled(false); setCode(''); } catch (err) { setError(getApiErrorMessage(err)); } }
  return <div className="pf-section grid gap-4 lg:grid-cols-2">
    {role === 'admin' ? <section className="pf-card p-5"><p className="pf-eyebrow !text-teal-700">Security</p><h2 className="mt-1 font-semibold">Two-factor authentication</h2><p className="mt-2 text-sm text-slate-600">Status: <span className={enabled ? 'badge-green' : 'rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600'}>{enabled ? 'Enabled' : 'Disabled'}</span></p>{error ? <p className="pf-error mt-3">{error}</p> : null}{setup ? <div className="mt-4 grid gap-3"><img className="mx-auto h-44 w-44 max-w-full" src={setup.qrCodeDataUrl} alt="Authenticator setup QR code"/><p className="break-all rounded-lg bg-slate-50 p-2 text-xs">Manual key: <strong>{setup.manualSecret}</strong></p><input className="input text-center tracking-[.25em]" aria-label="Verification code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/><button className="btn-primary" onClick={() => void confirmSetup()} disabled={code.length !== 6}>Verify and enable</button></div> : enabled ? <div className="mt-4 grid gap-2"><input className="input text-center tracking-[.25em]" aria-label="Verification code to disable" placeholder="6-digit code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/><button className="btn-secondary" onClick={() => void disable()} disabled={code.length !== 6}>Disable 2FA</button></div> : <button className="btn-primary mt-4" onClick={() => void beginSetup()}>Set up 2FA</button>}</section> : null}
    <section className="pf-card p-5"><p className="pf-eyebrow !text-teal-700">Accountability</p><h2 className="mt-1 font-semibold">Recent activity</h2>{activity.length ? <ol className="mt-4 space-y-3">{activity.slice(0,10).map((item) => <li className="border-l-2 border-teal-200 pl-3" key={item.id}><p className="text-sm font-semibold text-slate-800">{labels[item.action] ?? item.action.replace(/_/g,' ')}</p><time className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</time></li>)}</ol> : <p className="mt-4 text-sm text-slate-500">No account activity has been recorded yet.</p>}</section>
  </div>;
}
