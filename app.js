const firebaseConfig = {
  apiKey: "AIzaSyDgaSrT59ryXX8v4PZ02a3kMlADrY5Vuzs",
  authDomain: "gestor-de-inventario-3cd71.firebaseapp.com",
  projectId: "gestor-de-inventario-3cd71",
  storageBucket: "gestor-de-inventario-3cd71.firebasestorage.app",
  messagingSenderId: "256314278957",
  appId: "1:256314278957:web:51501902aa9c86f79da4a4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// VISTA: Grupos de Trabajo
function TeamsPage({ teams, activeTeamId, onNew, onDelete, onSelectTeam, onCopyInviteLink }) {
  return (
    <div style={{animation:'fadeUp .3s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div>
          <h3 style={{fontSize:'20px',fontWeight:800}}>Grupos de Trabajo</h3>
          <p style={{fontSize:'13px',color:'#475569',marginTop:'2px'}}>Crea un grupo, copia su enlace de invitación o selecciónalo para abrir su inventario colaborativo.</p>
        </div>
        <button className="btn btn-blue btn-sm" onClick={onNew}>➕ Crear Nuevo Grupo</button>
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h4>No perteneces a ningún grupo</h4>
          <p>Crea un grupo de trabajo y comparte su enlace con tus compañeros.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(t => {
            const isActive = t.id === activeTeamId;
            return (
              <div className={`team-card ${isActive ? 'active-team' : ''}`} key={t.id}>
                <div className="team-header">
                  <div>
                    <div className="team-name">{t.name} {isActive && '🔵 (Activo)'}</div>
                    <div className="team-meta">Creador: {t.ownerEmail}</div>
                  </div>
                  <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                    {!isActive && (
                      <button className="btn btn-secondary btn-sm" style={{padding:'6px 12px'}} onClick={() => onSelectTeam(t.id)}>
                        Entrar
                      </button>
                    )}
                    {t.isOwner && (
                      <button className="card-btn card-btn-del" style={{padding:'6px',flex:'initial'}} onClick={()=>onDelete(t.id)}>🗑</button>
                    )}
                  </div>
                </div>
                <div className="team-members">
                  <p style={{fontSize:'11px',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'4px'}}>Miembros autorizados ({t.members ? t.members.length : 0})</p>
                  {t.members && t.members.map((m, idx) => (
                    <div className="member-row" key={idx}>
                      <span className="member-name">{m}</span>
                      <span className={`member-role ${m === t.ownerEmail ? 'owner' : 'member'}`}>
                        {m === t.ownerEmail ? 'Dueño' : 'Miembro'}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:'8px',borderTop:'1px solid #1a2235',paddingTop:'12px'}}>
                  <button className="btn btn-green btn-sm" style={{width:'100%',justifyContent:'center'}} onClick={() => onCopyInviteLink(t.id)}>
                    🔗 Copiar Enlace de Invitación
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// VISTA: Historial de Entradas y Salidas Auditadas
function HistoryPage({ historyLogs }) {
  return (
    <div style={{animation:'fadeUp .3s ease'}}>
      <div style={{marginBottom:'24px'}}>
        <h3 style={{fontSize:'20px',fontWeight:800}}>📜 Registro Histórico Auditado</h3>
        <p style={{fontSize:'13px',color:'#475569',marginTop:'2px'}}>Lista en tiempo real que detalla las entradas, salidas, fechas y responsables de cada cambio.</p>
      </div>

      {historyLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h4>Sin movimientos registrados</h4>
          <p>Las entradas y salidas aparecerán de forma automática cuando se altere el stock de un ítem.</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha e Hilo</th>
                <th>Artículo</th>
                <th>Acción / Movimiento</th>
                <th>Cantidad</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.map(log => {
                let dateStr = "Reciente";
                if(log.timestamp) {
                  const d = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
                  dateStr = d.toLocaleString('es-ES', { hour12: false });
                }
                return (
                  <tr key={log.id}>
                    <td style={{fontWeight:'600',color:'#94a3b8'}}>{dateStr}</td>
                    <td style={{fontWeight:'700',color:'#f1f5f9'}}>{log.itemName}</td>
                    <td>
                      <span className={`badge-type ${log.action.toLowerCase()}`}>{log.action}</span>
                    </td>
                    <td style={{fontWeight:'700',color: log.action === 'Salida' ? '#f87171' : '#4ade80'}}>
                      {log.action === 'Salida' ? '-' : '+'}{log.qtyChanged} {log.unit || 'uds'}
                    </td>
                    <td style={{color:'#60a5fa',fontSize:'12px'}}>{log.userEmail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// PANTALLA DE LOGIN / REGISTRO
function AuthScreen({ onLogin, onRegister }) {
  const [isRegisterMode, setIsRegisterMode] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegisterMode) {
      const success = await onRegister(email, password, name);
      if (!success) setError('Error al registrar. Clave mínimo de 6 caracteres.');
    } else {
      const success = await onLogin(email, password);
      if (!success) setError('Credenciales incorrectas o usuario inexistente.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">📦</div>
        <h2 className="auth-title">{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        <p className="auth-sub">Gestor de Inventario Inteligente (Sincronizado)</p>
        
        {error && <div className="auth-field"><p className="field-error">{error}</p></div>}

        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="auth-field">
              <label>Nombre Completo</label>
              <input type="text" placeholder="Tu Nombre" value={name} onChange={e => setName(e.target.value)} required/>
            </div>
          )}
          <div className="auth-field">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required/>
          </div>
          <div className="auth-field">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <div className="login-spinner"></div> : (isRegisterMode ? 'Registrarse' : 'Ingresar')}
          </button>
        </form>

        <div className="auth-switch">
          {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta todavía?'} {' '}
          <button onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}>
            {isRegisterMode ? 'Inicia Sesión' : 'Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE PRINCIPAL GLOBAL
function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [page, setPage] = React.useState("inventory");
  const [toasts, setToasts] = React.useState([]);
  
  const [itemSets, setItemSets] = React.useState([
    { id: "set-1", name: "Almacén Central Planta A" },
    { id: "set-2", name: "Suministros de Oficina" },
    { id: "set-3", name: "Herramientas Críticas" }
  ]);
  const [activeSet, setActiveSet] = React.useState("set-1");
  const [items, setItems] = React.useState([]);
  const [historyLogs, setHistoryLogs] = React.useState([]);
  
  const [teams, setTeams] = React.useState([]);
  const [activeTeamId, setActiveTeamId] = React.useState(localStorage.getItem("activeTeamId") || null);

  const [search, setSearch] = React.useState("");
  const [filterStock, setFilterStock] = React.useState("all");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [setModalOpenFolder, setSetModalOpenFolder] = React.useState(false);
  const [teamModal, setTeamModal] = React.useState(false);

  const [formName, setFormName] = React.useState("");
  const [formCat, setFormCat] = React.useState("");
  const [formQty, setFormQty] = React.useState("");
  const [formMin, setFormMin] = React.useState("");
  const [formUnit, setFormUnit] = React.useState("uds");

  const [formSetName, setFormSetName] = React.useState("");
  const [teamFormName, setTeamFormName] = React.useState("");

  const showToast = (msg, type="info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const processInvitationUrl = async (userEmail) => {
    const params = new URLSearchParams(window.location.search);
    const teamIdToJoin = params.get("join");
    if (teamIdToJoin) {
      try {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: newUrl}, '', newUrl);

        await db.collection("teams").doc(teamIdToJoin).update({
          members: firebase.firestore.FieldValue.arrayUnion(userEmail)
        });

        setActiveTeamId(teamIdToJoin);
        localStorage.setItem("activeTeamId", teamIdToJoin);
        showToast("🎉 ¡Te has unido exitosamente al grupo de trabajo!", "success");
      } catch (err) {
        showToast("El enlace de invitación no es válido o caducó", "error");
      }
    }
  };

  React.useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userEmail = user.email.toLowerCase();
        setCurrentUser({
          uid: user.uid,
          email: userEmail,
          displayName: user.displayName || 'Operador',
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`
        });

        await processInvitationUrl(userEmail);

        const unsubscribeTeams = db.collection("teams")
          .where("members", "array-contains", userEmail)
          .onSnapshot((snapshot) => {
            const teamsFromCloud = snapshot.docs.map(doc => {
              const data = doc.data();
              return { id: doc.id, ...data, isOwner: data.ownerEmail === userEmail };
            });
            setTeams(teamsFromCloud);

            if (teamsFromCloud.length > 0) {
              const savedActive = localStorage.getItem("activeTeamId");
              const exists = teamsFromCloud.some(t => t.id === savedActive);
              if (!savedActive || !exists) {
                setActiveTeamId(teamsFromCloud[0].id);
                localStorage.setItem("activeTeamId", teamsFromCloud[0].id);
              } else {
                setActiveTeamId(savedActive);
              }
            } else {
              setActiveTeamId(null);
            }
          }, () => showToast("Error al enlazar los grupos", "error"));

        return () => unsubscribeTeams();
      } else {
        setCurrentUser(null);
        setTeams([]);
        setItems([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  React.useEffect(() => {
    if (!currentUser || !activeTeamId) {
      setItems([]);
      setHistoryLogs([]);
      return;
    }

    const unsubscribeItems = db.collection("inventarios")
      .where("teamId", "==", activeTeamId)
      .onSnapshot((snapshot) => {
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.error(err));

    const unsubscribeHistory = db.collection("historial")
      .where("teamId", "==", activeTeamId)
      .orderBy("timestamp", "desc")
      .limit(50)
      .onSnapshot((snapshot) => {
        setHistoryLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, err => console.error("Error al leer historial:", err));

    return () => { unsubscribeItems(); unsubscribeHistory(); };
  }, [currentUser, activeTeamId]);

  const logMovement = async (itemName, action, qtyChanged, unit) => {
    try {
      await db.collection("historial").add({
        teamId: activeTeamId,
        itemName: itemName,
        action: action,
        qtyChanged: Math.abs(qtyChanged),
        unit: unit,
        userEmail: currentUser.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(err) {
      console.error("Error al guardar auditoría de historial:", err);
    }
  };

  const handleLogin = async (email, password) => {
    try { await auth.signInWithEmailAndPassword(email, password); return true; } catch (err) { showToast(err.message, "error"); return false; }
  };

  const handleRegister = async (email, password, displayName) => {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      if (displayName && cred.user) await cred.user.updateProfile({ displayName });
      return true;
    } catch (err) { showToast(err.message, "error"); return false; }
  };

  const handleLogout = async () => { await auth.signOut(); localStorage.removeItem("activeTeamId"); };

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormName("");
    setFormCat("");
    setFormQty("");
    setFormMin("");
    setFormUnit("uds");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCat(item.category);
    setFormQty(item.quantity.toString());
    setFormMin(item.minStock.toString());
    setFormUnit(item.unit || "uds");
    setModalOpen(true);
  };

  const saveItem = async (e) => {
    e.preventDefault();
    if (!activeTeamId) { showToast("Selecciona un grupo primero", "error"); return; }
    if (!formName.trim() || !formCat.trim()) return;
    
    const newQty = parseInt(formQty) || 0; 
    const m = parseInt(formMin) || 0;

    const payload = {
      teamId: activeTeamId,
      setId: activeSet,
      name: formName,
      category: formCat,
      quantity: newQty,
      minStock: m,
      unit: formUnit,
      updatedBy: currentUser.email
    };

    try {
      if (editingItem) {
        const oldQty = editingItem.quantity || 0;
        await db.collection("inventarios").doc(editingItem.id).update(payload);
        
        if (newQty > oldQty) {
          await logMovement(formName, "Entrada", newQty - oldQty, formUnit);
        } else if (newQty < oldQty) {
          await logMovement(formName, "Salida", oldQty - newQty, formUnit);
        }
        showToast("Artículo actualizado con éxito", "success");
      } else {
        await db.collection("inventarios").add(payload);
        await logMovement(formName, "Creacion", newQty, formUnit);
        showToast("Artículo creado e indexado en el historial", "success");
      }
      setModalOpen(false);
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    const item = items.find(i => i.id === id);
    if (item && confirm(`¿Eliminar permanentemente ${item.name}?`)) {
      try {
        await db.collection("inventarios").doc(id).delete();
        await logMovement(item.name, "Salida", item.quantity, item.unit);
        showToast("Artículo destruido del almacén", "info");
      } catch (err) { showToast(err.message, "error"); }
    }
  };

  const toggleStatus = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const oldQty = item.quantity;
    const nextQty = oldQty === 0 ? item.minStock + 5 : 0;
    
    try {
      await db.collection("inventarios").doc(id).update({ quantity: nextQty, updatedBy: currentUser.email });
      if (nextQty > oldQty) {
        await logMovement(item.name, "Entrada", nextQty - oldQty, item.unit);
      } else {
        await logMovement(item.name, "Salida", oldQty, item.unit);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault(); if (!teamFormName.trim()) return;
    try {
      const newTeamRef = db.collection("teams").doc();
      await newTeamRef.set({ name: teamFormName, ownerEmail: currentUser.email, members: [currentUser.email] });
      setActiveTeamId(newTeamRef.id);
      localStorage.setItem("activeTeamId", newTeamRef.id);
      setTeamModal(false); setTeamFormName(""); setPage("inventory");
      showToast("Grupo de trabajo listo", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDeleteTeam = async (id) => {
    if (confirm("¿Deseas desvincular este grupo?")) {
      try { await db.collection("teams").doc(id).delete(); } catch (err) { showToast(err.message, "error"); }
    }
  };

  const handleCopyInviteLink = (teamId) => {
    const inviteUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?join=${teamId}`;
    navigator.clipboard.writeText(inviteUrl).then(() => showToast("📋 Enlace copiado al portapapeles", "success"));
  };

  const activeSetObj = itemSets.find(s => s.id === activeSet) || itemSets[0];
  const activeTeamObj = teams.find(t => t.id === activeTeamId);

  const filteredItems = items.filter(item => {
    if (item.setId !== activeSet) return false;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterStock === "no-stock") return item.quantity === 0;
    if (filterStock === "low-stock") return item.quantity > 0 && item.quantity <= item.minStock;
    if (filterStock === "ok") return item.quantity > item.minStock;
    return true;
  });

  if (authLoading) return <div className="loading-container"><div className="login-spinner" style={{width:'40px',height:'40px'}}></div></div>;
  if (!currentUser) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;

  return (
    <React.Fragment>
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>🔔 {t.msg}</div>)}
      </div>

      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <h1>📦 Gestor de Inventario Cloud</h1>
            <p>Grupo: <span style={{color:'#60a5fa',fontWeight:'700'}}>{activeTeamObj ? activeTeamObj.name : 'Ninguno'}</span></p>
          </div>
          <div className="header-right">
            <div className="user-pill">
              <div className="user-avatar" style={{backgroundColor:'#2563eb'}}><img src={currentUser.photoURL}/></div>
              <span>{currentUser.displayName}</span>
            </div>
            <button className="btn btn-red btn-sm" onClick={handleLogout}>🚪 Salir</button>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <p className="sidebar-section-label">Menú General</p>
          <div className="sidebar-menu">
            <button className={`sidebar-item ${page==="inventory"?'active':''}`} onClick={()=>setPage("inventory")}>📋 Panel de Inventario</button>
            <button className={`sidebar-item ${page==="history"?'active':''}`} onClick={()=>setPage("history")}>📜 Historial de Cambios</button>
            <button className={`sidebar-item ${page==="teams"?'active':''}`} onClick={()=>setPage("teams")}>👥 Grupos de Trabajo</button>
          </div>

          <p className="sidebar-section-label" style={{marginTop:'12px'}}>Colecciones</p>
          <div className="sidebar-menu">
            {itemSets.map(s => (
              <button key={s.id} className={`sidebar-item ${activeSet===s.id?'active':''}`} onClick={()=>{setActiveSet(s.id); setPage("inventory");}}>
                📁 {s.name}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{marginTop:'10px',justifyContent:'center'}} onClick={()=>setSetModalOpenFolder(true)}>➕ Nueva Carpeta</button>
        </aside>

        <div className="content-area">
          {page === "inventory" && (
            <React.Fragment>
              <div className="page-title-row">
                <div><h2>{activeSetObj.name}</h2><p>Almacenamiento e historial sincrónico</p></div>
                <button className="btn btn-blue" onClick={handleOpenNew}>➕ Añadir Artículo</button>
              </div>

              {!activeTeamId ? (
                <div className="empty-state">
                  <h4>Falta seleccionar un grupo de trabajo</h4>
                  <button className="btn btn-blue" style={{marginTop:'16px'}} onClick={() => setPage("teams")}>Configurar Grupos</button>
                </div>
              ) : (
                <React.Fragment>
                  <div className="controls-card">
                    <div className="search-input-wrap">
                      <input type="text" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
                    </div>
                    <select className="select-custom" value={filterStock} onChange={e=>setFilterStock(e.target.value)}>
                      <option value="all">Todos</option>
                      <option value="low-stock">Stock Bajo</option>
                      <option value="no-stock">Agotados</option>
                    </select>
                  </div>

                  <div className="grid-items">
                    {filteredItems.map(item => {
                      const isNoStock = item.quantity === 0;
                      const isLowStock = !isNoStock && item.quantity <= item.minStock;
                      const pct = Math.min(100, Math.max(4, (item.quantity / (item.minStock || 10)) * 50));
                      return (
                        <div className={`item-card ${isNoStock?'no-stock':''} ${isLowStock?'low-stock':''}`} key={item.id}>
                          <div className="card-top">
                            <div><span className="card-cat">{item.category}</span><h4 className="card-title">{item.name}</h4></div>
                          </div>
                          <div>
                            <div className="card-middle"><span className="card-qty">{item.quantity}</span><span className="card-unit">{item.unit}</span></div>
                            <div className="progress-track" style={{marginTop:'10px'}}><div className="progress-fill" style={{width:`${pct}%`,background: isNoStock ? '#ef4444' : '#10b981'}}/></div>
                          </div>
                          <div className="card-actions">
                            <button className="card-btn" onClick={()=>toggleStatus(item.id)}>🔄 Estado</button>
                            <button className="card-btn card-btn-edit" onClick={()=>openEdit(item)}>✏️ Editar</button>
                            <button className="card-btn card-btn-del" onClick={()=>handleDelete(item.id)}>🗑</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
          )}

          {page === "history" && <HistoryPage historyLogs={historyLogs} />}

          {page === "teams" && (
            <TeamsPage 
              teams={teams} activeTeamId={activeTeamId}
              onNew={()=>{setTeamModal(true); setTeamFormName("");}} onDelete={handleDeleteTeam}
              onSelectTeam={(id)=>{setActiveTeamId(id); localStorage.setItem("activeTeamId", id);}} onCopyInviteLink={handleCopyInviteLink}
            />
          )}
        </div>
      </div>

      {/* MODALES REUTILIZABLES */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header"><h3>{editingItem ? 'Editar Artículo' : 'Nuevo Artículo'}</h3></div>
            <form onSubmit={saveItem}>
              <div className="form-group"><label>Nombre del Artículo</label><input type="text" value={formName} onChange={e=>setFormName(e.target.value)} required/></div>
              <div className="form-group"><label>Categoría</label><input type="text" value={formCat} onChange={e=>setFormCat(e.target.value)} required/></div>
              <div className="form-row-grid">
                <div className="form-group"><label>Cantidad Actual</label><input type="number" value={formQty} onChange={e=>setFormQty(e.target.value)}/></div>
                <div className="form-group"><label>Stock Mínimo</label><input type="number" value={formMin} onChange={e=>setFormMin(e.target.value)}/></div>
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <select value={formUnit} onChange={e=>setFormUnit(e.target.value)}>
                  <option value="uds">Unidades (uds)</option><option value="kg">Kilogramos (kg)</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-blue">Confirmar en la Nube</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR GRUPO */}
      {teamModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header"><h3>Nuevo Grupo</h3></div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group"><label>Nombre</label><input type="text" value={teamFormName} onChange={e=>setTeamFormName(e.target.value)} required/></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setTeamModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-blue">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);