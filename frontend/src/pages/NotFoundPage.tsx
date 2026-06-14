import { Link } from 'react-router-dom';
import { CampusCareLogoMark } from '../components/brand/CampusCareLogoMark';
import { useAuth } from '../context/AuthContext';

function PathIllustration() {
  return (
    <svg aria-hidden="true" className="nf-illustration" viewBox="0 0 320 190" fill="none">
      <defs>
        <linearGradient id="nfPath" x1="40" y1="36" x2="270" y2="157" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9e8a" />
          <stop offset="1" stopColor="#67e3d6" />
        </linearGradient>
      </defs>
      <path d="M42 143c35-63 72-95 112-95 50 0 53 83 105 83 16 0 29-7 39-20" stroke="#dce9f1" strokeWidth="12" strokeLinecap="round" />
      <path d="M42 143c35-63 72-95 112-95 50 0 53 83 105 83 16 0 29-7 39-20" stroke="url(#nfPath)" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 9" />
      <circle cx="42" cy="143" r="18" fill="#e8f8f5" stroke="#0d9e8a" strokeWidth="2" />
      <path d="m35 143 5 5 10-12" stroke="#0d9e8a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="158" cy="50" r="21" fill="#eef6fb" stroke="#9fc7dc" strokeWidth="2" />
      <path d="M150 50h16M158 42v16" stroke="#256b91" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="280" cy="124" r="25" fill="#071527" />
      <path d="M280 141s12-10.8 12-20.5a12 12 0 1 0-24 0c0 9.7 12 20.5 12 20.5Z" fill="#0d9e8a" stroke="#67e3d6" strokeWidth="1.5" />
      <circle cx="280" cy="120" r="4" fill="#fff" />
      <path d="M78 163h142" stroke="#e3edf4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function NotFoundPage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <style>{`
        .nf-page{min-height:100vh;overflow:hidden;padding:1.25rem;color:#0b1d35;background:radial-gradient(circle at 10% 10%,rgba(103,227,214,.18),transparent 26rem),radial-gradient(circle at 92% 78%,rgba(37,99,235,.09),transparent 28rem),linear-gradient(145deg,#f8fbff,#edf5f8);font-family:"DM Sans",sans-serif}
        .nf-shell{display:grid;width:min(880px,100%);min-height:calc(100vh - 2.5rem);margin:auto;place-items:center}
        .nf-card{position:relative;overflow:hidden;width:100%;border:1px solid #dfeaf3;border-radius:26px;padding:2rem;background:rgba(255,255,255,.93);box-shadow:0 28px 80px rgba(7,21,39,.12);backdrop-filter:blur(18px)}
        .nf-card::after{content:"404";position:absolute;right:-.5rem;bottom:-2.4rem;color:rgba(11,29,53,.035);font-family:"Sora",sans-serif;font-size:10rem;font-weight:800;line-height:1;pointer-events:none}
        .nf-brand{display:flex;align-items:center;gap:.8rem}
        .nf-brand strong{display:block;font-family:"Sora",sans-serif;font-size:.95rem}
        .nf-brand span{display:block;margin-top:.15rem;color:#64748b;font-size:.68rem}
        .nf-content{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(260px,.92fr);align-items:center;gap:2rem;margin-top:1.75rem}
        .nf-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(13,158,138,.2);border-radius:999px;padding:.35rem .7rem;color:#0d7e70;background:#effbf8;font-size:.65rem;font-weight:850;letter-spacing:.07em;text-transform:uppercase}
        .nf-pill i{width:7px;height:7px;border-radius:50%;background:#0d9e8a;box-shadow:0 0 0 4px rgba(13,158,138,.09)}
        .nf-copy h1{max-width:550px;margin:.9rem 0 .65rem;font-family:"Sora",sans-serif;font-size:clamp(2rem,5vw,3.4rem);line-height:1.08;letter-spacing:0}
        .nf-copy>p{max-width:560px;margin:0;color:#64748b;font-size:.88rem;line-height:1.7}
        .nf-actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.35rem}
        .nf-button{display:inline-flex;min-height:43px;align-items:center;justify-content:center;gap:.45rem;border:1px solid #dce7ee;border-radius:11px;padding:.6rem 1rem;color:#334155;background:#fff;box-shadow:0 6px 16px rgba(15,23,42,.05);font-size:.75rem;font-weight:800;text-decoration:none;transition:.18s ease}
        .nf-button:hover{transform:translateY(-2px);border-color:rgba(13,158,138,.3);color:#0d7e70}
        .nf-button-primary{border-color:#0d9e8a;color:#fff;background:#0d9e8a;box-shadow:0 10px 24px rgba(13,158,138,.2)}
        .nf-button-primary:hover{color:#fff;background:#0b8d7b}
        .nf-visual{display:grid;min-height:260px;place-items:center;border:1px solid #e2ecf3;border-radius:20px;background:radial-gradient(circle at 70% 30%,rgba(103,227,214,.18),transparent 45%),linear-gradient(145deg,#f8fcfe,#edf5f8)}
        .nf-illustration{width:min(100%,330px);height:auto}
        .nf-links{position:relative;z-index:1;margin-top:1.7rem;border-top:1px solid #e6eef4;padding-top:1.15rem}
        .nf-links h2{margin:0 0 .65rem;font-family:"Sora",sans-serif;font-size:.8rem}
        .nf-link-row{display:flex;flex-wrap:wrap;gap:.5rem}
        .nf-link-row a{border:1px solid #dfeaf3;border-radius:999px;padding:.4rem .7rem;color:#64748b;background:#f9fcfe;font-size:.65rem;font-weight:750;text-decoration:none;transition:.18s ease}
        .nf-link-row a:hover{border-color:rgba(13,158,138,.25);color:#0d7e70;background:#effbf8}
        @media(max-width:720px){.nf-card{padding:1.3rem;border-radius:20px}.nf-content{grid-template-columns:1fr;gap:1.2rem;margin-top:1.3rem}.nf-visual{min-height:190px}.nf-illustration{width:min(100%,280px)}.nf-card::after{font-size:7rem}.nf-actions{display:grid;grid-template-columns:1fr 1fr}.nf-button-primary{grid-column:1/-1}}
        @media(max-width:430px){.nf-page{padding:.75rem}.nf-shell{min-height:calc(100vh - 1.5rem)}.nf-actions{grid-template-columns:1fr}.nf-button-primary{grid-column:auto}.nf-link-row a{flex:1;text-align:center}}
      `}</style>
      <main className="nf-page">
        <div className="nf-shell">
          <section className="nf-card" aria-labelledby="not-found-title">
            <div className="nf-brand">
              <CampusCareLogoMark size={46} variant="light" />
              <div><strong>CampusCare</strong><span>Student support platform</span></div>
            </div>
            <div className="nf-content">
              <div className="nf-copy">
                <span className="nf-pill"><i />Page not found</span>
                <h1 id="not-found-title">This page is not available.</h1>
                <p>The link may be incorrect, moved, or unavailable for your workspace.</p>
                <div className="nf-actions">
                  <Link className="nf-button nf-button-primary" to="/">Back to home</Link>
                  {!isLoading && isAuthenticated ? <Link className="nf-button" to="/dashboard">Go to dashboard</Link> : <Link className="nf-button" to="/start">Choose workspace</Link>}
                  <Link className="nf-button" to="/login">Sign in</Link>
                </div>
              </div>
              <div className="nf-visual"><PathIllustration /></div>
            </div>
            <div className="nf-links">
              <h2>Useful places</h2>
              <nav aria-label="Useful CampusCare links" className="nf-link-row">
                <Link to="/#modules">Modules</Link>
                <Link to="/#roles">Roles</Link>
                <Link to="/start">Start</Link>
                <Link to="/login">Login</Link>
                {!isLoading && isAuthenticated ? <Link to="/dashboard">Dashboard</Link> : null}
              </nav>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

