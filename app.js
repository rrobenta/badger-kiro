/* ── Firebase Config ──────────────────────────────── */
firebase.initializeApp({
  apiKey: "AIzaSyDrUnp3qcYUNBes-Rlv9IFobMCMmca-tnY",
  authDomain: "badger-mma.firebaseapp.com",
  projectId: "badger-mma",
  storageBucket: "badger-mma.firebasestorage.app",
  messagingSenderId: "730536389291",
  appId: "1:730536389291:web:3e8c698ffb2593f832e5ee"
});

const auth = firebase.auth();
const db   = firebase.firestore();

/* ── Auth ────────────────────────────────────────── */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass  = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('login-btn');
  errEl.textContent = '';
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => { btn.textContent = 'Sign In'; btn.disabled = false; })
    .catch(err => {
      errEl.textContent = err.message.replace('Firebase: ', '');
      btn.textContent = 'Sign In';
      btn.disabled = false;
    });
}

function handleLogout() {
  auth.signOut();
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initApp();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});

/* ── State ───────────────────────────────────────── */
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let state = { members: [], classes: [], payments: [], checkins: [], expenses: [], monthlySummaries: [], rates: { monthly: 150, dropin: 20 } };
let unsubscribers = [];

function initApp() {
  // Listen to Firestore collections in real-time
  listenCollection('members',  data => { state.members  = data; onDataChange(); });
  listenCollection('classes',  data => { state.classes  = data; onDataChange(); });
  listenCollection('payments', data => { state.payments = data; onDataChange(); });
  listenCollection('checkins', data => { state.checkins = data; onDataChange(); });
  listenCollection('expenses', data => { state.expenses = data; onDataChange(); });
  listenCollection('monthlySummaries', data => { state.monthlySummaries = data; onDataChange(); });

  // Load rates
  db.collection('settings').doc('rates').onSnapshot(doc => {
    if (doc.exists) state.rates = doc.data();
    onDataChange();
  });

  // Check if we need to close out previous month
  checkAndSaveMonthSummary();
}

function listenCollection(name, callback) {
  const unsub = db.collection(name).onSnapshot(snapshot => {
    const data = [];
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    callback(data);
  });
  unsubscribers.push(unsub);
}

function onDataChange() {
  renderPage(currentPage);
}

/* ── Monthly Summary Auto-Save ───────────────────── */
function checkAndSaveMonthSummary() {
  // Wait a moment for data to load, then check
  setTimeout(() => {
    const now = new Date();
    // Check if last month's summary already exists
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth()+1).padStart(2,'0')}`;

    // Check Firestore for existing summary
    db.collection('monthlySummaries').doc(lastMonthKey).get().then(doc => {
      if (!doc.exists) {
        // Calculate and save last month's summary
        const revenue = state.payments
          .filter(p => p.date && p.date.startsWith(lastMonthKey))
          .reduce((s, p) => s + p.amount, 0);
        const expenses = state.expenses
          .filter(e => e.date && e.date.startsWith(lastMonthKey))
          .reduce((s, e) => s + e.amount, 0);
        const net = revenue - expenses;
        const checkins = state.checkins.filter(c => c.date && c.date.startsWith(lastMonthKey)).length;

        // Only save if there was any activity
        if (revenue > 0 || expenses > 0 || checkins > 0) {
          db.collection('monthlySummaries').doc(lastMonthKey).set({
            month: lastMonthKey,
            label: lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            revenue,
            expenses,
            net,
            checkins,
            members: state.members.length,
            savedAt: new Date().toISOString()
          });
        }
      }
    }).catch(() => {});
  }, 3000);
}

// Firestore helpers
function addDoc(collection, data) {
  return db.collection(collection).add(data);
}
function deleteDoc(collection, id) {
  return db.collection(collection).doc(id).delete();
}
function updateDoc(collection, id, data) {
  return db.collection(collection).doc(id).update(data);
}

/* ── Navigation ──────────────────────────────────── */
let currentPage = 'dashboard';

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  currentPage = page;
  renderPage(page);
}

function renderPage(page) {
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'members':   renderMembers();   break;
    case 'classes':   renderClasses();   break;
    case 'payments':  renderPayments();  break;
    case 'expenses':  renderExpenses();  break;
  }
}

/* ── Dashboard ───────────────────────────────────── */
function renderDashboard() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  const todayDay = DAYS[today.getDay()];
  const todayClasses = state.classes.filter(c => c.day === todayDay);
  const todayCheckins = state.checkins.filter(c => c.date === todayStr);

  document.getElementById('stat-members').textContent = state.members.length;
  document.getElementById('stat-active').textContent  = todayCheckins.length;
  document.getElementById('stat-classes').textContent = todayClasses.length;
  document.getElementById('stat-revenue').textContent = '$' + monthRevenue();

  // Monthly expenses and net
  const now2 = new Date();
  const thisMonth2 = `${now2.getFullYear()}-${String(now2.getMonth()+1).padStart(2,'0')}`;
  const monthName = now2.toLocaleDateString('en-US', { month: 'long' });
  const monthExp = state.expenses.filter(e => e.date && e.date.startsWith(thisMonth2)).reduce((s,e) => s+e.amount, 0);
  const monthRev = parseFloat(monthRevenue());
  const monthNet = monthRev - monthExp;
  document.getElementById('stat-expenses').textContent = '$' + monthExp.toFixed(0);
  document.getElementById('stat-revenue-label').textContent = `Revenue (${monthName})`;
  document.getElementById('stat-expenses-label').textContent = `Expenses (${monthName})`;
  document.getElementById('stat-net-label').textContent = `Net Profit (${monthName})`;
  const netEl = document.getElementById('stat-net');
  netEl.textContent = (monthNet >= 0 ? '$' : '-$') + Math.abs(monthNet).toFixed(0);
  netEl.style.color = monthNet >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

  renderDailySummary(todayStr);
  renderAttendanceChart();
  renderRevenueChart();
  renderClassAttendanceChart();
  renderReminders();
  renderMonthlyHistory();

  // Today's classes
  const cl = document.getElementById('today-classes-list');
  if (todayClasses.length === 0) { cl.innerHTML = emptyState('No classes scheduled today'); }
  else { cl.innerHTML = todayClasses.map(c => {
    const [h, m] = c.time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h%12)||12)+':'+String(m).padStart(2,'0');
    return `<div class="list-item"><div class="avatar" style="background:var(--accent-blue);color:#fff;font-size:11px">${h12}</div>
      <div class="item-info"><div class="item-title">${c.name}</div><div class="item-sub">👤 ${c.instructor} · ${ampm}</div></div></div>`;
  }).join(''); }

  // Recent check-ins
  const ci = document.getElementById('checkins-list');
  const recent = [...todayCheckins].sort((a,b) => (b.time||'').localeCompare(a.time||'')).slice(0, 5);
  if (recent.length === 0) { ci.innerHTML = emptyState('No check-ins yet today'); }
  else {
    ci.innerHTML = recent.map(c => `
      <div class="list-item">
        <div class="avatar" style="background:${avatarBg(c.name)}">${initials(c.name)}</div>
        <div class="item-info">
          <div class="item-title">${c.name}</div>
          <div class="item-sub">${c.className || 'General'} · ${c.time}</div>
        </div>
        <span class="badge badge-green">Checked in</span>
      </div>`).join('');
  }
}

function renderDailySummary(todayStr) {
  const monthlyIncome = state.payments.filter(p => p.date === todayStr && p.type === 'monthly').reduce((s,p) => s+p.amount, 0);
  const dropinIncome  = state.payments.filter(p => p.date === todayStr && p.type === 'dropin').reduce((s,p) => s+p.amount, 0);
  const expenses      = state.expenses.filter(e => e.date === todayStr).reduce((s,e) => s+e.amount, 0);
  const profit = monthlyIncome + dropinIncome - expenses;

  document.getElementById('ds-monthly').textContent  = '$' + monthlyIncome.toFixed(0);
  document.getElementById('ds-dropin').textContent   = '$' + dropinIncome.toFixed(0);
  document.getElementById('ds-expenses').textContent = '-$' + expenses.toFixed(0);
  const profitEl = document.getElementById('ds-profit');
  profitEl.textContent = (profit >= 0 ? '$' : '-$') + Math.abs(profit).toFixed(0);
  profitEl.className = 'summary-val ' + (profit >= 0 ? 'positive' : 'negative');
}

function isMemberActive(m) {
  if (m.type === 'dropin') return true;
  if (!m.expiry) return false;
  return m.expiry >= new Date().toISOString().split('T')[0];
}

function monthRevenue() {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  return state.payments.filter(p => p.date && p.date.startsWith(thisMonth)).reduce((s,p) => s+p.amount, 0).toFixed(0);
}

/* ── Charts ──────────────────────────────────────── */
function renderAttendanceChart() {
  const el = document.getElementById('chart-attendance');
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today); monday.setDate(monday.getDate() - diffToMon);
  const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ label: WEEK_DAYS[i], count: state.checkins.filter(c => c.date === dateStr).length });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  el.innerHTML = `<div class="chart-bars">${days.map(d => `
    <div class="chart-col"><div class="chart-bar-wrap"><div class="chart-bar" style="height:${(d.count/max)*100}%"></div></div><div class="chart-label">${d.label}</div><div class="chart-value">${d.count}</div></div>`).join('')}</div>`;
}

function renderRevenueChart() {
  const el = document.getElementById('chart-revenue');
  const today = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleDateString('en-US', { month:'short' });
    const income = state.payments.filter(p => p.date && p.date.startsWith(key)).reduce((s,p) => s+p.amount, 0);
    months.push({ label, income });
  }
  const max = Math.max(...months.map(m => m.income), 1);
  el.innerHTML = `<div class="chart-bars">${months.map(m => `
    <div class="chart-col"><div class="chart-bar-wrap"><div class="chart-bar revenue-bar" style="height:${(m.income/max)*100}%"></div></div><div class="chart-label">${m.label}</div><div class="chart-value">$${m.income}</div></div>`).join('')}</div>`;
}

function renderClassAttendanceChart() {
  const el = document.getElementById('chart-class-attendance');
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const thirtyStr = thirtyAgo.toISOString().split('T')[0];
  const counts = {};
  state.checkins.filter(c => c.date >= thirtyStr && c.className).forEach(c => { counts[c.className] = (counts[c.className]||0)+1; });
  const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  const max = entries.length > 0 ? entries[0][1] : 1;
  const colors = ['var(--accent-blue)','var(--accent-green)','var(--accent-orange)','var(--accent-purple)','var(--accent-red)','#4fd1c5','#f6ad55'];
  if (entries.length === 0) { el.innerHTML = emptyState('No class attendance data yet'); return; }
  el.innerHTML = `<div class="plan-bars">${entries.map(([name,count],i) => `
    <div class="plan-row"><span class="plan-name">${name}</span><div class="plan-bar-bg"><div class="plan-bar-fill" style="width:${(count/max)*100}%;background:${colors[i%colors.length]}"></div></div><span class="plan-count">${count}</span></div>`).join('')}</div>`;
}

function renderReminders() {
  const today = new Date();
  const in7days = new Date(today); in7days.setDate(in7days.getDate() + 7);
  const in7Str = in7days.toISOString().split('T')[0];
  const expiring = state.members.filter(m => m.type === 'monthly' && m.expiry && m.expiry <= in7Str)
    .sort((a,b) => (a.expiry||'').localeCompare(b.expiry||''));
  const section = document.getElementById('reminders-section');
  const el = document.getElementById('reminders-list');
  if (expiring.length === 0) { section.style.display = 'none'; return; }
  section.style.display = '';
  el.innerHTML = expiring.map(m => {
    const daysLeft = Math.ceil((new Date(m.expiry) - today) / 86400000);
    let badge, label;
    if (daysLeft < 0) { badge='badge-red'; label=`Expired ${Math.abs(daysLeft)}d ago`; }
    else if (daysLeft === 0) { badge='badge-red'; label='Expires today'; }
    else { badge='badge-orange'; label=`${daysLeft}d left`; }
    return `<div class="list-item" onclick="showMemberDetail('${m.id}')">
      <div class="avatar" style="background:${avatarBg(m.name)}">${initials(m.name)}</div>
      <div class="item-info"><div class="item-title">${m.name}</div><div class="item-sub">Monthly · expires ${formatDate(m.expiry)}</div></div>
      <div class="item-right"><span class="badge ${badge}">${label}</span></div></div>`;
  }).join('');
}

function renderMonthlyHistory() {
  const section = document.getElementById('monthly-history-section');
  const el = document.getElementById('monthly-history-list');
  const summaries = [...state.monthlySummaries].sort((a,b) => (b.month||'').localeCompare(a.month||''));

  if (summaries.length === 0) { section.style.display = 'none'; return; }
  section.style.display = '';

  el.innerHTML = summaries.map(s => {
    const netColor = s.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    const netSign = s.net >= 0 ? '+$' : '-$';
    return `<div class="list-item">
      <div class="avatar" style="background:var(--surface2);color:var(--accent-purple);font-size:11px;font-weight:700">${(s.month||'').slice(5)}</div>
      <div class="item-info">
        <div class="item-title">${s.label || s.month}</div>
        <div class="item-sub">Revenue: $${(s.revenue||0).toFixed(0)} · Expenses: $${(s.expenses||0).toFixed(0)} · ${s.checkins||0} check-ins</div>
      </div>
      <div class="item-right"><div style="font-weight:700;color:${netColor}">${netSign}${Math.abs(s.net||0).toFixed(0)}</div></div>
    </div>`;
  }).join('');
}

/* ── Members ─────────────────────────────────────── */
let memberFilter = 'all';
let memberSearch = '';

function renderMembers() {
  let list = state.members.filter(m => {
    const active = isMemberActive(m);
    if (memberFilter === 'active' && !active) return false;
    if (memberFilter === 'inactive' && active) return false;
    if (memberSearch && !m.name.toLowerCase().includes(memberSearch.toLowerCase())) return false;
    return true;
  });
  const el = document.getElementById('members-list');
  if (list.length === 0) { el.innerHTML = emptyState('No members found'); return; }
  el.innerHTML = list.map(m => {
    const active = isMemberActive(m);
    const typeLabel = m.type === 'monthly' ? 'Monthly' : 'Drop-in';
    const badge = active ? `<span class="badge badge-green">Active</span>` : `<span class="badge badge-red">Expired</span>`;
    const sub = m.type === 'monthly' ? `${typeLabel} · ${m.expiry ? 'exp '+formatDate(m.expiry) : '—'}` : typeLabel;
    return `<div class="list-item" onclick="showMemberDetail('${m.id}')">
      <div class="avatar" style="background:${avatarBg(m.name)}">${initials(m.name)}</div>
      <div class="item-info"><div class="item-title">${m.name}</div><div class="item-sub">${sub}</div></div>
      <div class="item-right">${badge}</div></div>`;
  }).join('');
}

function setMemberFilter(f, btn) {
  memberFilter = f;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMembers();
}
function filterMembers() { memberSearch = document.getElementById('member-search').value; renderMembers(); }

function showMemberDetail(id) {
  const m = state.members.find(x => x.id === id);
  if (!m) return;
  const active = isMemberActive(m);
  const typeLabel = m.type === 'monthly' ? 'Monthly' : 'Drop-in';

  // Unique class names from existing classes only
  const classNames = [...new Set(state.classes.map(c => c.name))].sort();
  const classOptions = classNames.map(name => `<option value="${name}">${name}</option>`).join('') + '<option value="General">General / Open Gym</option>';

  document.getElementById('detail-name').textContent = m.name;
  document.getElementById('member-detail-body').innerHTML = `
    <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-val">${m.phone||'—'}</span></div>
    <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${m.email||'—'}</span></div>
    <div class="detail-row"><span class="detail-key">Type</span><span class="detail-val">${typeLabel}</span></div>
    ${m.type === 'monthly' ? `<div class="detail-row"><span class="detail-key">Expires</span><span class="detail-val">${formatDate(m.expiry)}</span></div>` : ''}
    <div class="detail-row"><span class="detail-key">Status</span><span class="detail-val">${active ? '✅ Active' : '❌ Expired'}</span></div>
    <div class="form-group" style="margin-top:16px">
      <label>Check In to Class</label>
      <select id="checkin-class-sel">${classOptions}</select>
    </div>
    <div class="detail-actions">
      <button class="btn-checkin" onclick="doCheckIn('${m.id}')">Check In</button>
      <button class="btn-primary" style="width:auto;margin:0;padding:8px 16px;font-size:13px" onclick="editMember('${m.id}')">Edit</button>
      <button class="btn-primary" style="width:auto;margin:0;padding:8px 16px;font-size:13px;background:var(--accent-purple)" onclick="openPurchaseForMember('${m.id}'); closeModal('member-detail-modal')">Renew</button>
      <button class="btn-danger" onclick="deleteMember('${m.id}')">Remove</button>
    </div>`;
  openModal('member-detail-modal');
}

function editMember(id) {
  const m = state.members.find(x => x.id === id);
  if (!m) return;
  document.getElementById('detail-name').textContent = 'Edit Member';
  document.getElementById('member-detail-body').innerHTML = `
    <form onsubmit="saveMemberEdit(event, '${m.id}')">
      <div class="form-group"><label>Name</label><input type="text" id="em-name" value="${m.name||''}" required /></div>
      <div class="form-group"><label>Phone</label><input type="tel" id="em-phone" value="${m.phone||''}" /></div>
      <div class="form-group"><label>Email</label><input type="email" id="em-email" value="${m.email||''}" /></div>
      <div class="form-group"><label>Type</label>
        <select id="em-type"><option value="monthly" ${m.type==='monthly'?'selected':''}>Monthly</option><option value="dropin" ${m.type==='dropin'?'selected':''}>Drop-in</option></select></div>
      <div class="form-group"><label>Expiry (for monthly)</label><input type="date" id="em-expiry" value="${m.expiry||''}" /></div>
      <div class="detail-actions">
        <button type="submit" class="btn-primary" style="width:auto;margin:0;padding:10px 20px">Save</button>
        <button type="button" class="btn-danger" onclick="deleteMember('${m.id}')">Delete</button>
      </div>
    </form>`;
}

function saveMemberEdit(e, id) {
  e.preventDefault();
  updateDoc('members', id, {
    name: document.getElementById('em-name').value.trim(),
    phone: document.getElementById('em-phone').value.trim(),
    email: document.getElementById('em-email').value.trim(),
    type: document.getElementById('em-type').value,
    expiry: document.getElementById('em-expiry').value || null
  });
  closeModal('member-detail-modal');
  toast('Member updated');
}

function openPurchaseForMember(id) {
  openModal('buy-sessions-modal');
  setTimeout(() => { document.getElementById('bs-member').value = id; }, 50);
}

function doCheckIn(memberId) {
  const m = state.members.find(x => x.id === memberId);
  if (!m) return;
  const className = document.getElementById('checkin-class-sel').value;

  // If drop-in, auto-charge
  if (m.type === 'dropin') {
    addDoc('payments', {
      memberId: m.id, memberName: m.name, amount: state.rates.dropin,
      desc: `Drop-in: ${className}`, type: 'dropin',
      date: new Date().toISOString().split('T')[0]
    });
  }

  const now = new Date();
  addDoc('checkins', {
    memberId: m.id, name: m.name, className,
    time: now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
    date: now.toISOString().split('T')[0]
  });

  const extra = m.type === 'dropin' ? ` ($${state.rates.dropin} charged)` : '';
  toast(`${m.name} → ${className} ✓${extra}`);
  closeModal('member-detail-modal');
}

function deleteMember(id) {
  deleteDoc('members', id);
  toast('Member removed');
  closeModal('member-detail-modal');
}

function addMember(e) {
  e.preventDefault();
  addDoc('members', {
    name: document.getElementById('m-name').value.trim(),
    phone: document.getElementById('m-phone').value.trim(),
    email: document.getElementById('m-email').value.trim(),
    type: 'dropin', expiry: null
  });
  closeModal('add-member-modal');
  e.target.reset();
  toast('Member added');
}

/* ── Purchase ────────────────────────────────────── */
function purchasePlan(e) {
  e.preventDefault();
  const memberId = document.getElementById('bs-member').value;
  const type     = document.getElementById('bs-type').value;
  const amount   = parseFloat(document.getElementById('bs-amount').value);
  const date     = document.getElementById('bs-date').value;

  const member = state.members.find(m => m.id === memberId);
  if (!member) return;

  if (type === 'monthly') {
    const exp = new Date(date); exp.setDate(exp.getDate() + 30);
    updateDoc('members', memberId, { type: 'monthly', expiry: exp.toISOString().split('T')[0] });
  }

  addDoc('payments', {
    memberId, memberName: member.name, amount,
    desc: type === 'monthly' ? 'Monthly' : 'Drop-in', type, date
  });

  // Save rate
  db.collection('settings').doc('rates').set({ ...state.rates, [type]: amount }, { merge: true });

  closeModal('buy-sessions-modal');
  document.getElementById('buy-sessions-form').reset();
  toast(`${type === 'monthly' ? 'Monthly' : 'Drop-in'} purchase recorded`);
}

function updatePurchaseTotal() {
  const type = document.getElementById('bs-type').value;
  if (state.rates[type]) document.getElementById('bs-amount').value = state.rates[type];
}

/* ── Classes ─────────────────────────────────────── */
let selectedDay = DAYS[new Date().getDay()];

function renderClasses() {
  const picker = document.getElementById('day-picker');
  picker.innerHTML = DAYS.map(d => `<button class="day-pill${d===selectedDay?' active':''}" onclick="selectDay('${d}',this)">${d}</button>`).join('');
  renderClassList();
}
function selectDay(day, btn) {
  selectedDay = day;
  document.querySelectorAll('.day-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderClassList();
}
function renderClassList() {
  const filtered = state.classes.filter(c => c.day === selectedDay).sort((a,b) => a.time.localeCompare(b.time));
  const el = document.getElementById('classes-list');
  if (filtered.length === 0) { el.innerHTML = emptyState('No classes on this day'); return; }
  el.innerHTML = filtered.map(c => classCardHTML(c)).join('');
}

function classCardHTML(c) {
  const [h, m] = c.time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = ((h % 12) || 12) + ':' + String(m).padStart(2,'0');
  const daysStr = Array.isArray(c.days) ? c.days.join(', ') : (c.day || '');
  return `<div class="class-card" onclick="showClassDetail('${c.id}')">
    <div class="class-time-block"><div class="class-time">${h12}</div><div class="class-dur">${ampm}</div></div>
    <div class="class-info"><div class="class-name">${c.name}</div><div class="class-instructor">👤 ${c.instructor}</div><div class="class-instructor" style="margin-top:2px">${daysStr}</div></div>
    <div class="class-actions">
      <button class="delete-class-btn" onclick="event.stopPropagation(); deleteClass('${c.id}')" title="Delete">✕</button></div></div>`;
}

function showClassDetail(id) {
  const c = state.classes.find(x => x.id === id);
  if (!c) return;
  document.getElementById('detail-name').textContent = 'Edit Class';
  document.getElementById('member-detail-body').innerHTML = `
    <form onsubmit="saveClassEdit(event, '${c.id}')">
      <div class="form-group"><label>Class Name</label><input type="text" id="ec-name" value="${c.name||''}" required /></div>
      <div class="form-group"><label>Instructor</label><input type="text" id="ec-instructor" value="${c.instructor||''}" required /></div>
      <div class="form-group"><label>Time</label><input type="time" id="ec-time" value="${c.time||''}" required /></div>
      <div class="detail-actions">
        <button type="submit" class="btn-primary" style="width:auto;margin:0;padding:10px 20px">Save</button>
        <button type="button" class="btn-danger" onclick="deleteClass('${c.id}'); closeModal('member-detail-modal')">Delete</button>
      </div>
    </form>`;
  openModal('member-detail-modal');
}

function saveClassEdit(e, id) {
  e.preventDefault();
  updateDoc('classes', id, {
    name: document.getElementById('ec-name').value.trim(),
    instructor: document.getElementById('ec-instructor').value.trim(),
    time: document.getElementById('ec-time').value
  });
  closeModal('member-detail-modal');
  toast('Class updated');
}

function deleteClass(id) { deleteDoc('classes', id); toast('Class removed'); }

function addClass(e) {
  e.preventDefault();
  const checkedDays = [...document.querySelectorAll('#c-days input:checked')].map(cb => cb.value);
  if (checkedDays.length === 0) { toast('Please select at least one day'); return; }

  const name = document.getElementById('c-name').value.trim();
  const instructor = document.getElementById('c-instructor').value.trim();
  const time = document.getElementById('c-time').value;

  // Create one class entry per selected day
  const promises = checkedDays.map(day => addDoc('classes', { name, instructor, day, days: checkedDays, time }));
  Promise.all(promises).then(() => {
    closeModal('add-class-modal');
    e.target.reset();
    toast(`${name} added for ${checkedDays.length} day(s)`);
  });
}

/* ── Payments ────────────────────────────────────── */
function renderPayments() {
  document.getElementById('monthly-revenue').textContent = '$' + monthRevenue();
  const sorted = [...state.payments].sort((a,b) => (b.date||'').localeCompare(a.date||''));
  const el = document.getElementById('payments-list');
  if (sorted.length === 0) { el.innerHTML = emptyState('No payments recorded'); return; }
  el.innerHTML = sorted.map(p => `<div class="list-item" onclick="showPaymentDetail('${p.id}')">
    <div class="avatar" style="background:${avatarBg(p.memberName)}">${initials(p.memberName)}</div>
    <div class="item-info"><div class="item-title">${p.memberName}</div><div class="item-sub">${p.desc||'—'} · ${formatDate(p.date)}</div></div>
    <div class="item-right"><div style="font-weight:700;color:var(--accent-green)">$${p.amount.toFixed(2)}</div></div></div>`).join('');
}

function showPaymentDetail(id) {
  const p = state.payments.find(x => x.id === id);
  if (!p) return;
  document.getElementById('detail-name').textContent = 'Edit Payment';
  document.getElementById('member-detail-body').innerHTML = `
    <form onsubmit="savePaymentEdit(event, '${p.id}')">
      <div class="form-group"><label>Member</label><input type="text" id="ep-member" value="${p.memberName||''}" required /></div>
      <div class="form-group"><label>Amount ($)</label><input type="number" id="ep-amount" value="${p.amount}" min="0.01" step="0.01" required /></div>
      <div class="form-group"><label>Description</label><input type="text" id="ep-desc" value="${p.desc||''}" /></div>
      <div class="form-group"><label>Type</label>
        <select id="ep-type"><option value="monthly" ${p.type==='monthly'?'selected':''}>Monthly</option><option value="dropin" ${p.type==='dropin'?'selected':''}>Drop-in</option><option value="other" ${p.type==='other'?'selected':''}>Other</option></select></div>
      <div class="form-group"><label>Date</label><input type="date" id="ep-date" value="${p.date||''}" required /></div>
      <div class="detail-actions">
        <button type="submit" class="btn-primary" style="width:auto;margin:0;padding:10px 20px">Save</button>
        <button type="button" class="btn-danger" onclick="deletePayment('${p.id}')">Delete</button>
      </div>
    </form>`;
  openModal('member-detail-modal');
}

function savePaymentEdit(e, id) {
  e.preventDefault();
  updateDoc('payments', id, {
    memberName: document.getElementById('ep-member').value.trim(),
    amount: parseFloat(document.getElementById('ep-amount').value),
    desc: document.getElementById('ep-desc').value.trim(),
    type: document.getElementById('ep-type').value,
    date: document.getElementById('ep-date').value
  });
  closeModal('member-detail-modal');
  toast('Payment updated');
}

function deletePayment(id) {
  deleteDoc('payments', id);
  closeModal('member-detail-modal');
  toast('Payment deleted');
}

function addPayment(e) {
  e.preventDefault();
  const memberId = document.getElementById('p-member').value;
  const member = state.members.find(m => m.id === memberId);
  addDoc('payments', {
    memberId, memberName: member ? member.name : 'Unknown',
    amount: parseFloat(document.getElementById('p-amount').value),
    desc: document.getElementById('p-desc').value.trim() || 'Payment',
    type: 'other', date: document.getElementById('p-date').value
  });
  closeModal('add-payment-modal');
  document.getElementById('add-payment-form').reset();
  toast('Payment recorded');
}

/* ── Expenses ────────────────────────────────────── */
function renderExpenses() {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthTotal = state.expenses.filter(e => e.date && e.date.startsWith(thisMonth)).reduce((s,e) => s+e.amount, 0);
  document.getElementById('monthly-expenses').textContent = '$' + monthTotal.toFixed(0);

  const sorted = [...state.expenses].sort((a,b) => (b.date||'').localeCompare(a.date||''));
  const el = document.getElementById('expenses-list');
  if (sorted.length === 0) { el.innerHTML = emptyState('No expenses recorded'); return; }
  const catColors = { Rent:'var(--accent-purple)', Utilities:'var(--accent-orange)', Equipment:'var(--accent-blue)', Salaries:'var(--accent-green)', Maintenance:'#4fd1c5', Marketing:'#f6ad55', Other:'var(--text-muted)' };
  el.innerHTML = sorted.map(e => `<div class="list-item" onclick="showExpenseDetail('${e.id}')">
    <div class="avatar" style="background:${catColors[e.category]||'var(--surface2)'};color:#fff;font-size:11px;">${(e.category||'').slice(0,3)}</div>
    <div class="item-info"><div class="item-title">${e.desc}</div><div class="item-sub">${e.category||''} · ${formatDate(e.date)}</div></div>
    <div class="item-right"><div style="font-weight:700;color:var(--accent-red)">-$${e.amount.toFixed(2)}</div></div></div>`).join('');
}

function showExpenseDetail(id) {
  const ex = state.expenses.find(x => x.id === id);
  if (!ex) return;
  const categories = ['Rent','Utilities','Equipment','Salaries','Maintenance','Marketing','Other'];
  document.getElementById('detail-name').textContent = 'Edit Expense';
  document.getElementById('member-detail-body').innerHTML = `
    <form onsubmit="saveExpenseEdit(event, '${ex.id}')">
      <div class="form-group"><label>Description</label><input type="text" id="ee-desc" value="${ex.desc||''}" required /></div>
      <div class="form-group"><label>Category</label>
        <select id="ee-category">${categories.map(c => `<option value="${c}" ${ex.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="form-group"><label>Amount ($)</label><input type="number" id="ee-amount" value="${ex.amount}" min="0.01" step="0.01" required /></div>
      <div class="form-group"><label>Date</label><input type="date" id="ee-date" value="${ex.date||''}" required /></div>
      <div class="detail-actions">
        <button type="submit" class="btn-primary" style="width:auto;margin:0;padding:10px 20px">Save</button>
        <button type="button" class="btn-danger" onclick="deleteExpense('${ex.id}')">Delete</button>
      </div>
    </form>`;
  openModal('member-detail-modal');
}

function saveExpenseEdit(e, id) {
  e.preventDefault();
  updateDoc('expenses', id, {
    desc: document.getElementById('ee-desc').value.trim(),
    category: document.getElementById('ee-category').value,
    amount: parseFloat(document.getElementById('ee-amount').value),
    date: document.getElementById('ee-date').value
  });
  closeModal('member-detail-modal');
  toast('Expense updated');
}

function deleteExpense(id) {
  deleteDoc('expenses', id);
  closeModal('member-detail-modal');
  toast('Expense deleted');
}

function addExpense(e) {
  e.preventDefault();
  addDoc('expenses', {
    desc: document.getElementById('e-desc').value.trim(),
    category: document.getElementById('e-category').value,
    amount: parseFloat(document.getElementById('e-amount').value),
    date: document.getElementById('e-date').value
  });
  closeModal('add-expense-modal');
  document.getElementById('add-expense-form').reset();
  toast('Expense added');
}

/* ── Modals ──────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  const today = new Date().toISOString().split('T')[0];
  if (id === 'add-payment-modal') {
    document.getElementById('p-date').value = today;
    document.getElementById('p-member').innerHTML = state.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }
  if (id === 'buy-sessions-modal') {
    document.getElementById('bs-date').value = today;
    document.getElementById('bs-member').innerHTML = state.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    const type = document.getElementById('bs-type').value;
    if (state.rates[type]) document.getElementById('bs-amount').value = state.rates[type];
  }
  if (id === 'add-expense-modal') { document.getElementById('e-date').value = today; }
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOnOverlay(e, id) { if (e.target.id === id) closeModal(id); }

/* ── Helpers ─────────────────────────────────────── */
function initials(name) { return (name||'?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2); }
const COLORS = ['#1e3a5f','#1a3a2e','#3a1a2e','#2e2a1a','#1a2a3e','#2a1a3e'];
function avatarBg(name) { let h=0; for(let i=0;i<(name||'').length;i++) h=name.charCodeAt(i)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; }
function formatDate(iso) { if(!iso) return '—'; const d=new Date(iso+'T00:00:00'); return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
function formatTime(timeStr) { const[h,m]=timeStr.split(':').map(Number); return ((h%12)||12)+':'+String(m).padStart(2,'0')+' '+(h>=12?'PM':'AM'); }
function emptyState(msg) { return `<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><p>${msg}</p></div>`; }

let toastTimer = null;
function toast(msg) { const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2500); }

/* ── Init ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
});
