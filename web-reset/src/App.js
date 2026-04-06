import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vovpgoxjchsiqvtjvcmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnBnb3hqY2hzaXF2dGp2Y21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjAwMTYsImV4cCI6MjA4NTU5NjAxNn0.cnCnjRlO3Bh9RiuWMCdia5ZS6thtLEJuZWsFVIrutBo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { detectSessionInUrl: true, persistSession: false },
});

const COLORS = {
  primary: '#e879a0',
  primaryDark: '#c0547a',
  primaryLight: '#fce4f0',
  bg: '#fdf6fa',
  card: '#ffffff',
  text: '#1a1a2e',
  muted: '#8a8a9a',
  border: '#f0d6e8',
  error: '#e53935',
  success: '#4caf50',
};

const strengthConfig = (pw) => {
  if (!pw) return null;
  if (pw.length < 6)  return { label: 'Too short', color: '#e53935', pct: 15 };
  if (pw.length < 8)  return { label: 'Weak',      color: '#ff9800', pct: 35 };
  if (pw.length < 12) return { label: 'Good',      color: '#ffc107', pct: 65 };
  return               { label: 'Strong',    color: '#4caf50', pct: 100 };
};

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const CheckIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const Spinner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sp{animation:spin .8s linear infinite;transform-origin:center}`}</style>
    <g className="sp"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></g>
  </svg>
);

export default function App() {
  const [session, setSession]       = useState(null);
  const [status, setStatus]         = useState('loading'); // loading | ready | invalid | success | error
  const [newPass, setNewPass]       = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(s);
        setStatus('ready');
      } else if (event === 'SIGNED_IN' && s) {
        setSession(s);
        if (status === 'loading') setStatus('ready');
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setStatus('ready');
      } else {
        setTimeout(() => {
          setStatus(prev => prev === 'loading' ? 'invalid' : prev);
        }, 3000);
      }
    });
  }, []);

  const strength = strengthConfig(newPass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPass.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirm) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      await supabase.auth.signOut();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
            </svg>
          </div>
          <div>
            <div style={styles.logoText}>Synclexia</div>
            <div style={styles.logoSub}>Learning Platform</div>
          </div>
        </div>

        <div style={styles.divider} />

        {status === 'loading' && <LoadingState />}
        {status === 'invalid' && <InvalidState />}
        {status === 'ready'   && (
          <ReadyState
            newPass={newPass} setNewPass={setNewPass}
            confirm={confirm} setConfirm={setConfirm}
            showNew={showNew} setShowNew={setShowNew}
            showConfirm={showConfirm} setShowConfirm={setShowConfirm}
            submitting={submitting} errorMsg={errorMsg}
            strength={strength} handleSubmit={handleSubmit}
          />
        )}
        {status === 'success' && <SuccessState />}
        {status === 'error'   && <ErrorState msg={errorMsg} />}

        <div style={styles.footer}>
          <span>© {new Date().getFullYear()} Synclexia · </span>
          <span style={{ color: COLORS.primary }}>Dyslexia Support Platform</span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={styles.centerBlock}>
      <div style={styles.loadingSpinner}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round">
          <style>{`@keyframes spin2{to{transform:rotate(360deg)}} .sp2{animation:spin2 .9s linear infinite;transform-origin:12px 12px}`}</style>
          <g className="sp2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></g>
        </svg>
      </div>
      <p style={styles.loadingText}>Verifying your reset link…</p>
    </div>
  );
}

function InvalidState() {
  return (
    <div style={styles.centerBlock}>
      <div style={{ ...styles.iconCircle, background: '#fff0f0', border: `2px solid ${COLORS.error}` }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 style={styles.stateTitle}>Link Expired or Invalid</h2>
      <p style={styles.stateDesc}>This password reset link is no longer valid. Please request a new one from the app.</p>
      <div style={{ ...styles.badge, background: '#fff0f0', color: COLORS.error }}>
        Reset links expire after 1 hour
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div style={styles.centerBlock}>
      <div style={{ ...styles.iconCircle, background: '#f0fff4', border: `2px solid ${COLORS.success}` }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.success} strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style={styles.stateTitle}>Password Updated!</h2>
      <p style={styles.stateDesc}>Your password has been changed successfully. You can now sign in to the Synclexia app with your new password.</p>
      <div style={{ ...styles.badge, background: COLORS.primaryLight, color: COLORS.primaryDark }}>
        ✓ You may now close this tab and return to the app
      </div>
    </div>
  );
}

function ErrorState({ msg }) {
  return (
    <div style={styles.centerBlock}>
      <div style={{ ...styles.iconCircle, background: '#fff0f0', border: `2px solid ${COLORS.error}` }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.error} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 style={styles.stateTitle}>Something Went Wrong</h2>
      <p style={styles.stateDesc}>{msg || 'An unexpected error occurred. Please try requesting a new reset link.'}</p>
    </div>
  );
}

function ReadyState({ newPass, setNewPass, confirm, setConfirm, showNew, setShowNew,
  showConfirm, setShowConfirm, submitting, errorMsg, strength, handleSubmit }) {

  const [newFocus, setNewFocus]         = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);

  const match = confirm.length > 0 && newPass === confirm;
  const mismatch = confirm.length > 0 && newPass !== confirm;

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={styles.headingWrap}>
        <div style={styles.iconCircle}>
          <LockIcon />
        </div>
        <div>
          <h2 style={styles.heading}>Set New Password</h2>
          <p style={styles.subheading}>Choose a strong password for your account.</p>
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>NEW PASSWORD</label>
        <div style={{
          ...styles.inputWrap,
          borderColor: newFocus ? COLORS.primary : COLORS.border,
          boxShadow: newFocus ? `0 0 0 3px ${COLORS.primaryLight}` : 'none',
        }}>
          <span style={styles.inputIcon}><LockIcon /></span>
          <input
            type={showNew ? 'text' : 'password'}
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="At least 6 characters"
            style={styles.input}
            onFocus={() => setNewFocus(true)}
            onBlur={() => setNewFocus(false)}
            autoComplete="new-password"
            required
          />
          <button type="button" style={styles.eyeBtn} onClick={() => setShowNew(v => !v)} tabIndex={-1}>
            <EyeIcon open={showNew} />
          </button>
        </div>

        {strength && (
          <div style={styles.strengthRow}>
            <div style={styles.strengthBg}>
              <div style={{ ...styles.strengthFill, width: `${strength.pct}%`, background: strength.color }} />
            </div>
            <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
          </div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>CONFIRM PASSWORD</label>
        <div style={{
          ...styles.inputWrap,
          borderColor: mismatch ? COLORS.error : confirmFocus ? COLORS.primary : COLORS.border,
          boxShadow: confirmFocus ? `0 0 0 3px ${mismatch ? '#fde8e8' : COLORS.primaryLight}` : 'none',
        }}>
          <span style={styles.inputIcon}><LockIcon /></span>
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            style={styles.input}
            onFocus={() => setConfirmFocus(true)}
            onBlur={() => setConfirmFocus(false)}
            autoComplete="new-password"
            required
          />
          <button type="button" style={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
            <EyeIcon open={showConfirm} />
          </button>
        </div>

        {confirm.length > 0 && (
          <div style={{ ...styles.matchRow, color: match ? COLORS.success : COLORS.error }}>
            {match
              ? <><CheckIcon size={15} /> <span>Passwords match</span></>
              : <><AlertIcon /> <span>Passwords do not match</span></>
            }
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={styles.errorBox}>
          <AlertIcon />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        style={{
          ...styles.submitBtn,
          opacity: (submitting || !newPass || !confirm) ? 0.65 : 1,
          cursor: (submitting || !newPass || !confirm) ? 'not-allowed' : 'pointer',
        }}
        disabled={submitting || !newPass || !confirm}
      >
        {submitting ? <Spinner /> : (
          <>
            <CheckIcon size={20} />
            <span>Update Password</span>
          </>
        )}
      </button>
    </form>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'fixed', top: '-120px', right: '-120px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, #fce4f0 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', bottom: '-100px', left: '-100px',
    width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, #ede9fe 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: COLORS.card,
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(232, 121, 160, 0.12), 0 4px 16px rgba(0,0,0,0.06)',
    border: `1px solid ${COLORS.border}`,
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
  },
  logoCircle: {
    width: '48px', height: '48px', borderRadius: '14px',
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 4px 14px ${COLORS.primary}55`,
  },
  logoText: {
    fontSize: '20px', fontWeight: '800', color: COLORS.text, letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize: '12px', color: COLORS.muted, fontWeight: '500', marginTop: '1px',
  },
  divider: {
    height: '1px', background: COLORS.border, marginBottom: '28px',
  },
  headingWrap: {
    display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px',
  },
  iconCircle: {
    width: '44px', height: '44px', minWidth: '44px', borderRadius: '12px',
    background: COLORS.primaryLight,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: COLORS.primary,
  },
  heading: {
    margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: COLORS.text,
  },
  subheading: {
    margin: 0, fontSize: '13px', color: COLORS.muted,
  },
  fieldGroup: { marginBottom: '18px' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '700',
    letterSpacing: '0.8px', color: COLORS.muted, marginBottom: '8px',
  },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    border: `1.5px solid ${COLORS.border}`, borderRadius: '12px',
    background: '#fafafa', padding: '0 14px', transition: 'all 0.2s',
  },
  inputIcon: { color: COLORS.muted, display: 'flex', alignItems: 'center', flexShrink: 0 },
  input: {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: '15px', color: COLORS.text, padding: '13px 0',
    fontFamily: "'Inter', sans-serif",
  },
  eyeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
    color: COLORS.muted, display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  strengthRow: {
    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px',
  },
  strengthBg: {
    flex: 1, height: '5px', borderRadius: '3px', background: '#f0f0f0', overflow: 'hidden',
  },
  strengthFill: {
    height: '5px', borderRadius: '3px', transition: 'all 0.3s',
  },
  strengthLabel: {
    fontSize: '12px', fontWeight: '700', minWidth: '55px',
  },
  matchRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', fontWeight: '600', marginTop: '7px',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#fff0f0', border: `1px solid #fca5a5`,
    borderRadius: '10px', padding: '10px 14px',
    color: COLORS.error, fontSize: '13px', fontWeight: '500',
    marginBottom: '16px',
  },
  submitBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '14px',
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: `0 4px 14px ${COLORS.primary}55`,
    transition: 'all 0.2s', marginTop: '4px',
  },
  centerBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '8px 0 12px',
  },
  iconCircle: {
    width: '64px', height: '64px', borderRadius: '18px',
    background: COLORS.primaryLight, border: `2px solid ${COLORS.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: COLORS.primary, marginBottom: '20px',
  },
  stateTitle: {
    fontSize: '22px', fontWeight: '800', color: COLORS.text, margin: '0 0 10px',
  },
  stateDesc: {
    fontSize: '14px', color: COLORS.muted, lineHeight: '1.6', margin: '0 0 18px',
    maxWidth: '300px',
  },
  badge: {
    fontSize: '12px', fontWeight: '600', padding: '8px 16px',
    borderRadius: '20px', letterSpacing: '0.2px',
  },
  loadingSpinner: { marginBottom: '16px' },
  loadingText: { fontSize: '14px', color: COLORS.muted, margin: 0 },
  footer: {
    marginTop: '28px', textAlign: 'center', fontSize: '12px', color: COLORS.muted,
  },
};
