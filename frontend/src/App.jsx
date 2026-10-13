import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Printer, Users, CheckCircle2, Clock3, XCircle, Save, CalendarDays, ArrowLeft, Eye, EyeOff, Heart, Mail, LockKeyhole, UserRound, LogOut } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);


const API = 'http://localhost:8080/api/guests';
const AUTH_API = 'http://localhost:8080/api/auth';
const blank = { name: '', phone: '', groupName: '', seats: 1, status: 'PENDING', notes: '' };
const statusLabel = { CONFIRMED: 'אישרו הגעה', PENDING: 'ממתינים לתשובה', DECLINED: 'לא מגיעים' };
const validEmailSuffixes = new Set(['com', 'net', 'org', 'edu', 'gov', 'io', 'co', 'ai', 'app', 'info', 'biz', 'me', 'tv', 'dev', 'tech', 'online', 'site', 'store', 'il', 'uk', 'de', 'fr', 'ca', 'au', 'us', 'in', 'jp']);
const validIsraelEmailSuffixes = new Set(['co', 'org', 'ac', 'gov', 'net', 'muni', 'idf']);

function hasValidEmailDomain(value) {
  const email = value.trim().toLowerCase();
  const match = email.match(/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)$/i);
  if (!match) return false;

  const labels = match[1].split('.');
  const suffix = labels.at(-1);
  if (!validEmailSuffixes.has(suffix)) return false;
  return suffix !== 'il' || labels.length >= 3 && validIsraelEmailSuffixes.has(labels.at(-2));
}

function RegistrationPage({ onComplete }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState(null);
  const isLogin = mode === 'login';

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (!isLogin && (!form.name.trim() || !form.email.trim() || !form.phone.trim())) {
      setError('יש למלא שם, כתובת אימייל ומספר טלפון.');
      return;
    }
    if (!hasValidEmailDomain(form.email)) {
      setError('כתובת האימייל אינה תקינה. בדקי את שם הדומיין והסיומת, למשל gmail.com או co.il.');
      return;
    }
    if (form.password.length < 8) {
      setError('הסיסמה צריכה להכיל לפחות 8 תווים.');
      return;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${AUTH_API}/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? {
          email: form.email.trim(),
          password: form.password,
        } : {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.detail || 'לא ניתן היה ליצור חשבון. נסי שוב.');
      }
      onComplete(await response.json());
    } catch (requestError) {
      setError(requestError.message || 'לא ניתן להתחבר לשרת כרגע.');
    } finally {
      setSubmitting(false);
    }
  }

  const intro = <section className="registration-intro">
    <div className="intro-brand"><span className="intro-mark">R</span><span>RavMeser</span></div>
    <div className="intro-content">
      <div className="intro-icon"><Heart size={26} fill="currentColor" /></div>
      <p className="intro-eyebrow">ניהול אירועים פשוט ומסודר</p>
      <h1>כל המוזמנים שלך,<br />במקום אחד.</h1>
      <p className="intro-copy">פותחים חשבון ותוכלו לנהל רשימות מוזמנים, אישורי הגעה וכל פרט קטן של האירוע.</p>
      <div className="intro-points">
        <span><CheckCircle2 size={18} /> רשימת מוזמנים מסודרת</span>
        <span><CheckCircle2 size={18} /> מעקב אחר אישורי הגעה</span>
        <span><CheckCircle2 size={18} /> גישה מכל מכשיר</span>
      </div>
    </div>
    <p className="intro-footer">© 2026 RavMeser · ניהול אירועים באהבה</p>
  </section>;

  if (!mode) return <main className="registration-page" dir="rtl">
    {intro}
    <section className="registration-panel">
      <div className="registration-card auth-choice-card">
        <div className="mobile-brand"><span className="intro-mark">R</span><span>RavMeser</span></div>
        <p className="form-kicker">ברוכות הבאות</p>
        <h2>איך תרצי להמשיך?</h2>
        <p className="form-subtitle">בחרי את האפשרות המתאימה לך.</p>
        <div className="auth-choice-actions">
          <button className="auth-choice-button primary-choice" onClick={() => setMode('register')}>יצירת חשבון חדש <ArrowLeft size={19} /></button>
          <button className="auth-choice-button" onClick={() => setMode('login')}>כבר יש לי חשבון <ArrowLeft size={19} /></button>
        </div>
      </div>
    </section>
  </main>;

  return <main className="registration-page" dir="rtl">
    {intro}

    <section className="registration-panel">
      <div className="registration-card">
        <div className="mobile-brand"><span className="intro-mark">R</span><span>RavMeser</span></div>
        <p className="form-kicker">{isLogin ? 'כניסה לחשבון' : 'יצירת חשבון חדש'}</p>
        <h2>{isLogin ? 'טוב שחזרת' : 'בואי נתחיל'}</h2>
        <p className="form-subtitle">{isLogin ? 'הזיני את הפרטים שלך כדי להמשיך לניהול האירוע.' : 'כמה פרטים קצרים, ואפשר להתחיל לתכנן.'}</p>

        {error && <div className="registration-error" role="alert">{error}</div>}

        <form className="registration-form" onSubmit={submit}>
          {!isLogin && <label>שם מלא
            <span className="input-with-icon"><UserRound size={18} /><input required autoFocus value={form.name} onChange={event => update('name', event.target.value)} placeholder="איך נקרא לך?" autoComplete="name" /></span>
          </label>}
          <label>כתובת אימייל
            <span className="input-with-icon"><Mail size={18} /><input required type="email" value={form.email} onChange={event => update('email', event.target.value)} placeholder="name@example.com" autoComplete="email" dir="ltr" /></span>
          </label>
          {!isLogin && <label>מספר טלפון
            <span className="input-with-icon"><UserRound size={18} /><input required type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} placeholder="050-000-0000" autoComplete="tel" dir="ltr" /></span>
          </label>}
          <label>סיסמה
            <span className="input-with-icon password-field"><LockKeyhole size={18} /><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={event => update('password', event.target.value)} placeholder="לפחות 8 תווים" autoComplete={isLogin ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'הסתרת סיסמה' : 'הצגת סיסמה'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
          </label>
          {!isLogin && <label>אימות סיסמה
            <span className="input-with-icon"><LockKeyhole size={18} /><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={event => update('confirmPassword', event.target.value)} placeholder="הקלידי שוב את הסיסמה" autoComplete="new-password" /></span>
          </label>}
          <button className="registration-submit" type="submit" disabled={submitting}>{submitting ? (isLogin ? 'מתחברות…' : 'יוצרות את החשבון…') : <>{isLogin ? 'כניסה לחשבון' : 'יצירת חשבון'} <ArrowLeft size={19} /></>}</button>
        </form>
        {!isLogin && <p className="terms-copy">בהרשמה את מאשרת את תנאי השימוש ומדיניות הפרטיות.</p>}
        <p className="login-copy">{isLogin ? 'עדיין אין לך חשבון?' : 'כבר יש לך חשבון?'} <button type="button" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}>{isLogin ? 'להרשמה' : 'להתחברות'}</button></p>
        <p className="login-copy"><button type="button" onClick={() => { setMode(null); setError(''); }}>חזרה לבחירת הרשמה או התחברות</button></p>
      </div>
    </section>
  </main>;
}

function Dashboard({ onLogout }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const { data: guests = [], isPending: busy, error: loadError, refetch: load } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await fetch(API, { credentials: 'include' });
      if (!response.ok) throw new Error('לא ניתן לטעון את רשימת המוזמנים');
      return response.json();
    },
  });
  const guestMutation = useMutation({
    mutationFn: async ({ url, method, payload }) => {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (!response.ok) throw new Error('השמירה נכשלה');
      return method === 'DELETE' ? null : response.json();
    },
  });
  const updateGuestCache = (updater) => queryClient.setQueryData(['guests'], current => updater(current || []));
  const displayedError = error || (loadError ? 'לא הצלחתי להתחבר לשרת. ודאי שה־Backend פועל בכתובת localhost:8080.' : '');
  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
    color: '#433852',
    fontSize: 13,
    fontWeight: 650,
  };

  const inputStyle = {
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    minHeight: 45,
    padding: '12px 13px',
    border: '1px solid #e5dfed',
    borderRadius: 11,
    background: '#fcfbfe',
    color: '#30263f',
    fontFamily: 'inherit',
    fontSize: 14,
  };
  const columnDefs = useMemo(() => [
    {
      field: "name",
      headerName: "שם המוזמן",
      editable: true,
      minWidth: 160,
    },
    {
      field: "phone",
      headerName: "טלפון",
      editable: true,
      minWidth: 140,
    },
    {
      field: "groupName",
      headerName: "קבוצה",
      editable: true,
    },
    {
      field: "seats",
      headerName: "מקומות",
      editable: true,
      cellEditor: "agNumberCellEditor",
      valueParser: (params) =>
          Math.max(1, Number(params.newValue) || 1),
    },
    {
      field: "status",
      headerName: "סטטוס",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["PENDING", "CONFIRMED", "DECLINED"],
      },
      valueFormatter: (params) => ({
        PENDING: "ממתינים לתשובה",
        CONFIRMED: "אישרו הגעה",
        DECLINED: "לא מגיעים",
      })[params.value] || params.value,
    },
    {
      field: "notes",
      headerName: "הערות",
      editable: true,
      minWidth: 180,
    },
  ], []);

  const filtered = useMemo(() => guests.filter(g => {
    const matches = [g.name, g.phone, g.groupName, g.notes].some(v => (v || '').toLowerCase().includes(query.toLowerCase()));
    return matches && (filter === 'ALL' || g.status === filter);
  }), [guests, query, filter]);
  const counts = useMemo(() => ({ all: guests.length, confirmed: guests.filter(g => g.status === 'CONFIRMED').length, pending: guests.filter(g => g.status === 'PENDING').length, seats: guests.filter(g => g.status === 'CONFIRMED').reduce((s,g) => s + Number(g.seats || 1), 0) }), [guests]);

  async function saveGuest(e) {
    e.preventDefault(); setError('');
    const payload = { ...draft, seats: Math.max(1, Number(draft.seats) || 1) };
    try {
      const saved = await guestMutation.mutateAsync({ url: editing ? `${API}/${editing}` : API, method: editing ? 'PUT' : 'POST', payload });
      updateGuestCache(old => editing ? old.map(g => g.id === saved.id ? saved : g) : [saved, ...old]);
      setShowForm(false); setDraft(blank); setEditing(null);
    } catch { setError('שמירת המוזמן נכשלה. בדקי שהשרת פועל ונסי שוב.'); }
  }
  function editGuest(g) { setEditing(g.id); setDraft({ name:g.name||'', phone:g.phone||'', groupName:g.groupName||'', seats:g.seats||1, status:g.status||'PENDING', notes:g.notes||'' }); setShowForm(true); }
  async function updateStatus(g, status) {
    try { const saved = await guestMutation.mutateAsync({ url: `${API}/${g.id}`, method: 'PUT', payload: { ...g, status } }); updateGuestCache(old => old.map(x => x.id === saved.id ? saved : x)); }
    catch { setError('לא ניתן לעדכן את הסטטוס.'); }
  }
  async function handleCellValueChanged(event) {
    const updatedGuest = { ...event.data };

    try {
      const savedGuest = await guestMutation.mutateAsync({ url: `${API}/${updatedGuest.id}`, method: 'PUT', payload: updatedGuest });
      updateGuestCache(previous => previous.map(guest => guest.id === savedGuest.id ? savedGuest : guest));

      setError("");
    } catch {
      setError("שמירת השינוי נכשלה. הרשימה תיטען מחדש.");
      await load();
    }
  }
  async function deleteGuest(g) {
    if (!confirm(`למחוק את ${g.name}?`)) return;
    try { await guestMutation.mutateAsync({ url: `${API}/${g.id}`, method: 'DELETE' }); updateGuestCache(old => old.filter(x => x.id !== g.id)); }
    catch { setError('מחיקת המוזמן נכשלה.'); }
  }
  function closeForm() { setShowForm(false); setDraft(blank); setEditing(null); }
  async function logout() {
    try {
      const response = await fetch(`${AUTH_API}/logout`, { method: 'POST', credentials: 'include' });
      if (!response.ok) throw new Error();
      queryClient.removeQueries({ queryKey: ['guests'] });
      onLogout();
    } catch {
      setError('לא ניתן היה להתנתק מהשרת. נסי שוב.');
    }
  }





  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">R</div><div><b></b><small>ניהול אירועים</small></div></div><div className="side-label">סביבת עבודה</div><div className="nav-item active"><Users size={18}/> רשימת מוזמנים</div><div className="side-note"><CalendarDays size={19}/><div><b>האירוע שלי</b><span>ניהול מוזמנים ואישורי הגעה</span></div></div><div className="sidebar-footer"><button className="logout-button" onClick={logout}><LogOut size={16}/> יציאה מהחשבון</button><span>גרסת הדגמה · React + Java</span></div></aside>
    <main className="main"><header className="topbar"><div><div className="eyebrow">לוח בקרה / מוזמנים</div><h1>רשימת מוזמנים</h1><p>כל המוזמנים והעדכונים של האירוע, במקום אחד.</p></div><button className="btn secondary" onClick={() => window.print()}><Printer size={17}/> הדפסת רשימה</button></header>
      {displayedError && <div className="error-banner">{displayedError}<button onClick={() => setError('')}>×</button></div>}
      <section className="stats"><div className="stat-card"><div className="stat-icon purple"><Users size={20}/></div><div><span>סה״כ מוזמנים</span><strong>{counts.all}</strong><small>רשומות ברשימה</small></div></div><div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={20}/></div><div><span>אישרו הגעה</span><strong>{counts.confirmed}</strong><small>{counts.seats} מקומות מאושרים</small></div></div><div className="stat-card"><div className="stat-icon amber"><Clock3 size={20}/></div><div><span>ממתינים לתשובה</span><strong>{counts.pending}</strong><small>כדאי ליצור קשר</small></div></div><div className="stat-card"><div className="stat-icon rose"><XCircle size={20}/></div><div><span>לא מגיעים</span><strong>{guests.filter(g=>g.status==='DECLINED').length}</strong><small>עדכון לפי הצורך</small></div></div></section>
      <section className="table-card"><div className="table-heading"><div><h2>כל המוזמנים</h2><span>{filtered.length} תוצאות</span></div><button className="btn primary" onClick={() => { setDraft(blank); setEditing(null); setShowForm(true); }}><Plus size={18}/> הוספת מוזמן</button></div>
        <div className="toolbar"><div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="חיפוש לפי שם, טלפון או קבוצה..."/></div><select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="סינון לפי סטטוס"><option value="ALL">כל הסטטוסים</option><option value="CONFIRMED">אישרו הגעה</option><option value="PENDING">ממתינים לתשובה</option><option value="DECLINED">לא מגיעים</option></select></div>
        {busy ? <div className="empty">טוען את רשימת המוזמנים…</div> : filtered.length === 0 ? <div className="empty"><Users size={30}/><b>עדיין אין מוזמנים להצגה</b><span>הוסיפי מוזמן חדש או נסי לשנות את החיפוש.</span></div> : <div style={{ height: 480, width: "100%" }}>
          <AgGridReact
              theme={themeQuartz}
              rowData={filtered}
              columnDefs={columnDefs}
           getRowId={(params) => String(params.data.id)}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                flex: 1,
                minWidth: 110,
                editable: true,
              }}
              onCellValueChanged={handleCellValueChanged}
              enableRtl={true}
          />
        </div>}
        <div className="table-footer">
          <span>מוצגים {filtered.length} מתוך {guests.length} מוזמנים</span>
          <button className="text-button" onClick={load}>
            רענון רשימה ↻
          </button>
        </div>
      </section>


      {showForm && (
          <div
              onClick={closeForm}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                background: "rgba(30, 24, 48, 0.55)",
                backdropFilter: "blur(5px)",
                overflowY: "auto",
              }}
          >
            <form
                onSubmit={saveGuest}
                onClick={(e) => e.stopPropagation()}
                style={{
                  direction: "rtl",
                  width: "100%",
                  maxWidth: 620,
                  maxHeight: "calc(100vh - 32px)",
                  overflowY: "auto",
                  boxSizing: "border-box",
                  padding: "28px",
                  background: "#ffffff",
                  border: "1px solid #eee8f7",
                  borderRadius: 22,
                  boxShadow: "0 24px 80px rgba(36, 23, 65, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  color: "#30263f",
                }}
            >
              {/* כותרת */}
              <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
              >
                <div
                    style={{
                      width: 54,
                      height: 54,
                      flexShrink: 0,
                      borderRadius: 17,
                      background: "linear-gradient(135deg, #f0e9ff, #e4dafa)",
                      color: "#7552b5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                >
                  {editing ? <Users size={25} /> : <Plus size={25} />}
                </div>

                <div style={{ flex: 1 }}>
                  <h2
                      style={{
                        margin: "0 0 7px",
                        fontSize: 23,
                        fontWeight: 750,
                        color: "#302342",
                      }}
                  >
                    {editing ? "עריכת מוזמן" : "הוספת מוזמן חדש"}
                  </h2>
                  <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#81778f",
                        lineHeight: 1.6,
                      }}
                  >
                    כל הפרטים במקום אחד, לניהול מסודר של האירוע
                  </p>
                </div>

                <button
                    type="button"
                    onClick={closeForm}
                    aria-label="סגירה"
                    style={{
                      width: 36,
                      height: 36,
                      border: 0,
                      borderRadius: 11,
                      background: "#f6f3fa",
                      color: "#786d8d",
                      fontSize: 25,
                      cursor: "pointer",
                    }}
                >
                  ×
                </button>
              </div>

              <div
                  style={{
                    height: 1,
                    background: "#eee9f5",
                  }}
              />

              <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#49375f",
                  }}
              >
                פרטי המוזמן
              </div>

              {/* שדות הטופס */}
              <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                    gap: "18px 16px",
                  }}
              >
                <label style={fieldStyle}>
                  <span>שם מלא <b style={{ color: "#d95776" }}>*</b></span>
                  <input
                      required
                      autoFocus
                      placeholder="הקלידי את שם המוזמן"
                      value={draft.name}
                      onChange={(e) =>
                          setDraft({ ...draft, name: e.target.value })
                      }
                      style={inputStyle}
                  />
                </label>

                <label style={fieldStyle}>
                  <span>מספר טלפון</span>
                  <input
                      type="tel"
                      placeholder="050-0000000"
                      value={draft.phone}
                      onChange={(e) =>
                          setDraft({ ...draft, phone: e.target.value })
                      }
                      style={inputStyle}
                  />
                </label>

                <label style={fieldStyle}>
                  <span>קבוצה / משפחה</span>
                  <input
                      placeholder="למשל: משפחת כהן"
                      value={draft.groupName}
                      onChange={(e) =>
                          setDraft({ ...draft, groupName: e.target.value })
                      }
                      style={inputStyle}
                  />
                </label>

                <label style={fieldStyle}>
                  <span>מספר מקומות</span>
                  <input
                      type="number"
                      min="1"
                      value={draft.seats}
                      onChange={(e) =>
                          setDraft({ ...draft, seats: e.target.value })
                      }
                      style={inputStyle}
                  />
                </label>

                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <span>סטטוס הגעה</span>
                  <select
                      value={draft.status}
                      onChange={(e) =>
                          setDraft({ ...draft, status: e.target.value })
                      }
                      style={inputStyle}
                  >
                    <option value="PENDING">ממתינים לתשובה</option>
                    <option value="CONFIRMED">אישרו הגעה</option>
                    <option value="DECLINED">לא מגיעים</option>
                  </select>
                </label>

                <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <span>הערות</span>
                  <textarea
                      rows="3"
                      placeholder="פרטים נוספים שכדאי לזכור..."
                      value={draft.notes}
                      onChange={(e) =>
                          setDraft({ ...draft, notes: e.target.value })
                      }
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        minHeight: 85,
                      }}
                  />
                </label>
              </div>

              {/* כפתורי פעולה */}
              <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    paddingTop: 18,
                    borderTop: "1px solid #eee9f5",
                  }}
              >
                <button
                    type="button"
                    onClick={closeForm}
                    style={{
                      flex: 1,
                      minHeight: 45,
                      padding: "0 18px",
                      borderRadius: 11,
                      border: "1px solid #e3dbea",
                      background: "#fff",
                      color: "#655675",
                      fontSize: 14,
                      fontWeight: 650,
                      cursor: "pointer",
                    }}
                >
                  ביטול
                </button>

                <button
                    type="submit"
                    className="btn primary"
                    style={{
                      flex: 1,
                      minHeight: 45,
                      padding: "0 18px",
                      borderRadius: 11,
                      border: "1px solid #7552b5",
                      background: "#7552b5",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 650,
                      cursor: "pointer",
                    }}
                >
                  <Save size={17} />
                  {editing ? "שמירת שינויים" : "שמירת מוזמן"}
                </button>
              </div>
            </form>
          </div>
      )}


      <footer className="page-footer">
         · ניהול אירועים בצורה פשוטה
      </footer>
    </main>
  </div>;

}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    fetch(`${AUTH_API}/me`, { credentials: 'include' })
      .then(response => response.ok ? response.json() : null)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setAuthReady(true));
  }, []);

  if (!authReady) return <main className="registration-loading">טוען…</main>;
  return profile ? <Dashboard onLogout={() => setProfile(null)} /> : <RegistrationPage onComplete={setProfile} />;
}
