import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Printer, Users, CheckCircle2, Clock3, XCircle, Trash2, Save, CalendarDays } from 'lucide-react';

import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);


const API = 'http://localhost:8080/api/guests';
const blank = { name: '', phone: '', groupName: '', seats: 1, status: 'PENDING', notes: '' };
const statusLabel = { CONFIRMED: 'אישרו הגעה', PENDING: 'ממתינים לתשובה', DECLINED: 'לא מגיעים' };

export default function App() {
  const [guests, setGuests] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
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

  const load = useCallback(async () => {
    setBusy(true); setError('');
    try { const r = await fetch(API); if (!r.ok) throw new Error('לא ניתן לטעון את רשימת המוזמנים'); setGuests(await r.json()); }
    catch { setError('לא הצלחתי להתחבר לשרת. ודאי שה־Backend פועל בכתובת localhost:8080.'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => guests.filter(g => {
    const matches = [g.name, g.phone, g.groupName, g.notes].some(v => (v || '').toLowerCase().includes(query.toLowerCase()));
    return matches && (filter === 'ALL' || g.status === filter);
  }), [guests, query, filter]);
  const counts = useMemo(() => ({ all: guests.length, confirmed: guests.filter(g => g.status === 'CONFIRMED').length, pending: guests.filter(g => g.status === 'PENDING').length, seats: guests.filter(g => g.status === 'CONFIRMED').reduce((s,g) => s + Number(g.seats || 1), 0) }), [guests]);

  async function saveGuest(e) {
    e.preventDefault(); setError('');
    const payload = { ...draft, seats: Math.max(1, Number(draft.seats) || 1) };
    try {
      const r = await fetch(editing ? `${API}/${editing}` : API, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(); const saved = await r.json();
      setGuests(old => editing ? old.map(g => g.id === saved.id ? saved : g) : [saved, ...old]);
      setShowForm(false); setDraft(blank); setEditing(null);
    } catch { setError('שמירת המוזמן נכשלה. בדקי שהשרת פועל ונסי שוב.'); }
  }
  function editGuest(g) { setEditing(g.id); setDraft({ name:g.name||'', phone:g.phone||'', groupName:g.groupName||'', seats:g.seats||1, status:g.status||'PENDING', notes:g.notes||'' }); setShowForm(true); }
  async function updateStatus(g, status) {
    setSavingId(g.id);
    try { const r = await fetch(`${API}/${g.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...g,status}) }); if (!r.ok) throw new Error(); const saved = await r.json(); setGuests(old => old.map(x => x.id === saved.id ? saved : x)); }
    catch { setError('לא ניתן לעדכן את הסטטוס.'); } finally { setSavingId(null); }
  }
  async function handleCellValueChanged(event) {
    const updatedGuest = { ...event.data };

    try {
      const response = await fetch(`${API}/${updatedGuest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedGuest),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const savedGuest = await response.json();

      setGuests((previous) =>
          previous.map((guest) =>
              guest.id === savedGuest.id ? savedGuest : guest
          )
      );

      setError("");
    } catch {
      setError("שמירת השינוי נכשלה. הרשימה תיטען מחדש.");
      await load();
    }
  }
  async function deleteGuest(g) {
    if (!confirm(`למחוק את ${g.name}?`)) return;
    try { const r = await fetch(`${API}/${g.id}`, {method:'DELETE'}); if (!r.ok) throw new Error(); setGuests(old => old.filter(x => x.id !== g.id)); }
    catch { setError('מחיקת המוזמן נכשלה.'); }
  }
  function closeForm() { setShowForm(false); setDraft(blank); setEditing(null); }





  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">R</div><div><b></b><small>ניהול אירועים</small></div></div><div className="side-label">סביבת עבודה</div><div className="nav-item active"><Users size={18}/> רשימת מוזמנים</div><div className="side-note"><CalendarDays size={19}/><div><b>האירוע שלי</b><span>ניהול מוזמנים ואישורי הגעה</span></div></div><div className="sidebar-footer">גרסת הדגמה · React + Java</div></aside>
    <main className="main"><header className="topbar"><div><div className="eyebrow">לוח בקרה / מוזמנים</div><h1>רשימת מוזמנים</h1><p>כל המוזמנים והעדכונים של האירוע, במקום אחד.</p></div><button className="btn secondary" onClick={() => window.print()}><Printer size={17}/> הדפסת רשימה</button></header>
      {error && <div className="error-banner">{error}<button onClick={() => setError('')}>×</button></div>}
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