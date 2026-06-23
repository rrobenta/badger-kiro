/* ── State ───────────────────────────────────────── */
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem('badgergym');
    const ver   = localStorage.getItem('badgergym_v');
    if (saved && ver === '5') return JSON.parse(saved);
  } catch(e) {}
  localStorage.setItem('badgergym_v', '5');
  return {
    members:  sampleMembers(),
    classes:  sampleClasses(),
    payments: samplePayments(),
    checkins: sampleCheckins(),
    expenses: sampleExpenses(),
    rates: { monthly: 150, dropin: 20 }
  };
}

function saveState() {
  localStorage.setItem('badgergym', JSON.stringify(state));
}

/* ── Sample Data ─────────────────────────────────── */
function sampleMembers() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate()+n); return fmt(d); };
  return [
    { id: 1, name: 'Alex Johnson',  phone: '555-0101', email: 'alex@example.com',   type: 'monthly', expiry: addDays(10)  },
    { id: 2, name: 'Maria Garcia',  phone: '555-0102', email: 'maria@example.com',  type: 'monthly', expiry: addDays(25)  },
    { id: 3, name: 'Chris Lee',     phone: '555-0103', email: 'chris@example.com',  type: 'monthly', expiry: addDays(5)   },
    { id: 4, name: 'Sam Patel',     phone: '555-0104', email: 'sam@example.com',    type: 'dropin',  expiry: null         },
    { id: 5, name: 'Jordan Kim',    phone: '555-0105', email: 'jordan@example.com', type: 'monthly', expiry: addDays(-3)  },
  ];
}

function sampleClasses() {
  return [
    { id: 1, name: 'Morning Yoga',    instructor: 'Lisa Chen',   day: 'Mon', time: '07:00', duration: 60, capacity: 15 },
    { id: 2, name: 'HIIT Blast',      instructor: 'Mike Torres', day: 'Mon', time: '18:00', duration: 45, capacity: 20 },
    { id: 3, name: 'Spin Class',      instructor: 'Sarah Davis', day: 'Tue', time: '06:30', duration: 45, capacity: 12 },
    { id: 4, name: 'Strength & Core', instructor: 'Mike Torres', day: 'Wed', time: '17:30', duration: 60, capacity: 18 },
    { id: 5, name: 'Pilates',         instructor: 'Lisa Chen',   day: 'Thu', time: '10:00', duration: 50, capacity: 10 },
    { id: 6, name: 'Kickboxing',      instructor: 'James Brown', day: 'Fri', time: '19:00', duration: 60, capacity: 20 },
    { id: 7, name: 'Weekend Flow',    instructor: 'Lisa Chen',   day: 'Sat', time: '09:00', duration: 75, capacity: 15 },
  ];
}

function samplePayments() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate()+n); return fmt(d); };
  return [
    { id: 1, memberId: 1, memberName: 'Alex Johnson', amount: 150, desc: 'Monthly', type: 'monthly', date: addDays(-20) },
    { id: 2, memberId: 2, memberName: 'Maria Garcia', amount: 150, desc: 'Monthly', type: 'monthly', date: addDays(-5)  },
    { id: 3, memberId: 3, memberName: 'Chris Lee',    amount: 150, desc: 'Monthly', type: 'monthly', date: addDays(-25) },
    { id: 4, memberId: 4, memberName: 'Sam Patel',    amount: 20,  desc: 'Drop-in', type: 'dropin',  date: addDays(-2)  },
    { id: 5, memberId: 4, memberName: 'Sam Patel',    amount: 20,  desc: 'Drop-in', type: 'dropin',  date: addDays(0)   },
    { id: 6, memberId: 5, memberName: 'Jordan Kim',   amount: 150, desc: 'Monthly', type: 'monthly', date: addDays(-33) },
    { id: 7, memberId: 1, memberName: 'Alex Johnson', amount: 150, desc: 'Monthly', type: 'monthly', date: addDays(0)   },
  ];
}

function sampleCheckins() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate()+n); return fmt(d); };
  const checkins = [];
  const members = [
    { id: 1, name: 'Alex Johnson' },{ id: 2, name: 'Maria Garcia' },
    { id: 3, name: 'Chris Lee' },{ id: 4, name: 'Sam Patel' },{ id: 5, name: 'Jordan Kim' }
  ];
  const classNames = ['Morning Yoga','HIIT Blast','Spin Class','Strength & Core','Pilates','Kickboxing','Weekend Flow'];
  for (let i = 30; i >= 0; i--) {
    const count = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < count; j++) {
      const m = members[j % members.length];
      checkins.push({
        id: Date.now() - i*100000 - j, memberId: m.id, name: m.name,
        className: classNames[Math.floor(Math.random() * classNames.length)],
        time: `${8+Math.floor(Math.random()*10)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
        date: addDays(-i)
      });
    }
  }
  return checkins;
}

function sampleExpenses() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDays = n => { const d = new Date(today); d.setDate(d.getDate()+n); return fmt(d); };
  return [
    { id: 1, desc: 'Electricity bill',  category: 'Utilities',    amount: 120, date: addDays(-5)  },
    { id: 2, desc: 'Monthly rent',      category: 'Rent',         amount: 800, date: addDays(-1)  },
    { id: 3, desc: 'New punching bags', category: 'Equipment',    amount: 250, date: addDays(-10) },
    { id: 4, desc: 'Cleaning supplies', category: 'Maintenance',  amount: 35,  date: addDays(0)   },
    { id: 5, desc: 'Coach salary',      category: 'Salaries',     amount: 500, date: addDays(-3)  },
  ];
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

  // Daily summary
  renderDailySummary(todayStr);

  // Charts
  renderAttendanceChart();
  renderRevenueChart();
  renderClassAttendanceChart();

  // Expiry reminders
  renderReminders();

  // Today's classes
  const cl = document.getElementById('today-classes-list');
  if (todayClasses.length === 0) {
    cl.innerHTML = emptyState('No classes scheduled today');
  } else {
    cl.innerHTML = todayClasses.map(c => classCardHTML(c)).join('');
  }

  // Recent check-ins
  const ci = document.getElementById('checkins-list');
  const recent = [...todayCheckins].reverse().slice(0, 5);
  if (recent.length === 0) {
    ci.innerHTML = emptyState('No check-ins yet today');
  } else {
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
  const monthlyIncome = state.payments
    .filter(p => p.date === todayStr && p.type === 'monthly')
    .reduce((s, p) => s + p.amount, 0);
  const dropinIncome = state.payments
    .filter(p => p.date === todayStr && p.type === 'dropin')
    .reduce((s, p) => s + p.amount, 0);
  const expenses = state.expenses
    .filter(e => e.date === todayStr)
    .reduce((s, e) => s + e.amount, 0);
  const profit = monthlyIncome + dropinIncome - expenses;

  document.getElementById('ds-monthly').textContent = '$' + monthlyIncome.toFixed(0);
  document.getElementById('ds-dropin').textContent  = '$' + dropinIncome.toFixed(0);
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
  return state.payments
    .filter(p => p.date.startsWith(thisMonth))
    .reduce((s, p) => s + p.amount, 0)
    .toFixed(0);
}

/* ── Charts ──────────────────────────────────────── */
function renderAttendanceChart() {
  const el = document.getElementById('chart-attendance');
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - diffToMon);

  const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const count = state.checkins.filter(c => c.date === dateStr).length;
    days.push({ label: WEEK_DAYS[i], count });
  }
  const max = Math.max(...days.map(d => d.count), 1);
  el.innerHTML = `
    <div class="chart-bars">
      ${days.map(d => `
        <div class="chart-col">
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${(d.count/max)*100}%"></div>
          </div>
          <div class="chart-label">${d.label}</div>
          <div class="chart-value">${d.count}</div>
        </div>`).join('')}
    </div>`;
}

function renderRevenueChart() {
  const el = document.getElementById('chart-revenue');
  const today = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleDateString('en-US', { month:'short' });
    const income = state.payments.filter(p => p.date.startsWith(key)).reduce((s,p) => s+p.amount, 0);
    const expense = state.expenses.filter(e => e.date.startsWith(key)).reduce((s,e) => s+e.amount, 0);
    months.push({ label, income, expense, profit: income - expense });
  }
  const max = Math.max(...months.map(m => m.income), 1);
  el.innerHTML = `
    <div class="chart-bars">
      ${months.map(m => `
        <div class="chart-col">
          <div class="chart-bar-wrap">
            <div class="chart-bar revenue-bar" style="height:${(m.income/max)*100}%"></div>
          </div>
          <div class="chart-label">${m.label}</div>
          <div class="chart-value">$${m.income}</div>
        </div>`).join('')}
    </div>`;
}

function renderClassAttendanceChart() {
  const el = document.getElementById('chart-class-attendance');
  const today = new Date();
  const thirtyAgo = new Date(today);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const thirtyStr = thirtyAgo.toISOString().split('T')[0];

  const counts = {};
  state.checkins
    .filter(c => c.date >= thirtyStr && c.className)
    .forEach(c => { counts[c.className] = (counts[c.className] || 0) + 1; });

  const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  const max = entries.length > 0 ? entries[0][1] : 1;
  const colors = ['var(--accent-blue)','var(--accent-green)','var(--accent-orange)','var(--accent-purple)','var(--accent-red)','#4fd1c5','#f6ad55'];

  if (entries.length === 0) {
    el.innerHTML = emptyState('No class attendance data yet');
    return;
  }

  el.innerHTML = `
    <div class="plan-bars">
      ${entries.map(([name, count], i) => `
        <div class="plan-row">
          <span class="plan-name">${name}</span>
          <div class="plan-bar-bg">
            <div class="plan-bar-fill" style="width:${(count/max)*100}%;background:${colors[i%colors.length]}"></div>
          </div>
          <span class="plan-count">${count}</span>
        </div>`).join('')}
    </div>`;
}

function renderReminders() {
  const today = new Date();
  const in7days = new Date(today);
  in7days.setDate(in7days.getDate() + 7);
  const in7Str = in7days.toISOString().split('T')[0];

  const expiring = state.members.filter(m => {
    if (m.type !== 'monthly') return false;
    if (!m.expiry) return false;
    return m.expiry <= in7Str;
  }).sort((a, b) => (a.expiry||'').localeCompare(b.expiry||''));

  const section = document.getElementById('reminders-section');
  const el      = document.getElementById('reminders-list');

  if (expiring.length === 0) { section.style.display = 'none'; return; }

  section.style.display = '';
  el.innerHTML = expiring.map(m => {
    const daysLeft = Math.ceil((new Date(m.expiry) - today) / 86400000);
    let badge, label;
    if (daysLeft < 0) { badge = 'badge-red'; label = `Expired ${Math.abs(daysLeft)}d ago`; }
    else if (daysLeft === 0) { badge = 'badge-red'; label = 'Expires today'; }
    else { badge = 'badge-orange'; label = `${daysLeft}d left`; }
    return `
      <div class="list-item" onclick="showMemberDetail(${m.id})">
        <div class="avatar" style="background:${avatarBg(m.name)}">${initials(m.name)}</div>
        <div class="item-info">
          <div class="item-title">${m.name}</div>
          <div class="item-sub">Monthly · expires ${formatDate(m.expiry)}</div>
        </div>
        <div class="item-right"><span class="badge ${badge}">${label}</span></div>
      </div>`;
  }).join('');
}

/* ── Members ─────────────────────────────────────── */
let memberFilter = 'all';
let memberSearch = '';

function renderMembers() {
  let list = state.members.filter(m => {
    const active = isMemberActive(m);
    if (memberFilter === 'active'   && !active) return false;
    if (memberFilter === 'inactive' && active)  return false;
    if (memberSearch && !m.name.toLowerCase().includes(memberSearch.toLowerCase())) return false;
    return true;
  });

  const el = document.getElementById('members-list');
  if (list.length === 0) { el.innerHTML = emptyState('No members found'); return; }

  el.innerHTML = list.map(m => {
    const active = isMemberActive(m);
    const typeLabel = m.type === 'monthly' ? 'Monthly' : 'Drop-in';
    const badge = active
      ? `<span class="badge badge-green">Active</span>`
      : `<span class="badge badge-red">Expired</span>`;
    const sub = m.type === 'monthly'
      ? `${typeLabel} · ${m.expiry ? 'exp ' + formatDate(m.expiry) : '—'}`
      : typeLabel;
    return `
      <div class="list-item" onclick="showMemberDetail(${m.id})">
        <div class="avatar" style="background:${avatarBg(m.name)}">${initials(m.name)}</div>
        <div class="item-info">
          <div class="item-title">${m.name}</div>
          <div class="item-sub">${sub}</div>
        </div>
        <div class="item-right">${badge}</div>
      </div>`;
  }).join('');
}

function setMemberFilter(f, btn) {
  memberFilter = f;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMembers();
}

function filterMembers() {
  memberSearch = document.getElementById('member-search').value;
  renderMembers();
}

function showMemberDetail(id) {
  const m = state.members.find(x => x.id === id);
  if (!m) return;
  const active = isMemberActive(m);
  const typeLabel = m.type === 'monthly' ? 'Monthly' : 'Drop-in';

  // Build class options for check-in
  const allClasses = state.classes.sort((a,b) => a.name.localeCompare(b.name));
  const classOptions = allClasses.map(c => `<option value="${c.name}">${c.name} — ${c.day} ${formatTime(c.time)}</option>`).join('') + '<option value="General">General / Open Gym</option>';

  document.getElementById('detail-name').textContent = m.name;
  document.getElementById('member-detail-body').innerHTML = `
    <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-val">${m.phone||'—'}</span></div>
    <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${m.email||'—'}</span></div>
    <div class="detail-row"><span class="detail-key">Type</span><span class="detail-val">${typeLabel}</span></div>
    ${m.type === 'monthly' ? `<div class="detail-row"><span class="detail-key">Expires</span><span class="detail-val">${formatDate(m.expiry)}</span></div>` : ''}
    <div class="detail-row"><span class="detail-key">Status</span><span class="detail-val">${active ? '✅ Active' : '❌ Expired'}</span></div>

    <div class="form-group" style="margin-top:16px">
      <label>Check In to Class</label>
      <select id="checkin-class-${m.id}">${classOptions}</select>
    </div>
    <div class="detail-actions">
      <button class="btn-checkin" onclick="doCheckIn(${m.id}, document.getElementById('checkin-class-${m.id}').value)">Check In</button>
      <button class="btn-primary" style="width:auto;margin:0;padding:8px 16px;font-size:13px" onclick="openPurchaseForMember(${m.id}); closeModal('member-detail-modal')">Renew / Purchase</button>
      <button class="btn-danger" onclick="deleteMember(${m.id}); closeModal('member-detail-modal')">Remove</button>
    </div>`;
  openModal('member-detail-modal');
}

function openPurchaseForMember(id) {
  openModal('buy-sessions-modal');
  setTimeout(() => { document.getElementById('bs-member').value = id; }, 50);
}

function doCheckIn(memberId, className) {
  const m = state.members.find(x => x.id === memberId);
  if (!m) return;

  // If drop-in, auto-charge
  if (m.type === 'dropin') {
    const amount = state.rates.dropin;
    state.payments.push({
      id: Date.now(), memberId: m.id, memberName: m.name,
      amount, desc: `Drop-in: ${className}`, type: 'dropin',
      date: new Date().toISOString().split('T')[0]
    });
  }

  const now = new Date();
  state.checkins.push({
    id: Date.now() + 1, memberId: m.id, name: m.name,
    className, time: now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
    date: now.toISOString().split('T')[0]
  });
  saveState();
  const extra = m.type === 'dropin' ? ` ($${state.rates.dropin} charged)` : '';
  toast(`${m.name} → ${className} ✓${extra}`);
  closeModal('member-detail-modal');
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'members') renderMembers();
  if (currentPage === 'payments') renderPayments();
}

function deleteMember(id) {
  state.members = state.members.filter(m => m.id !== id);
  saveState();
  toast('Member removed');
  renderMembers();
  if (currentPage === 'dashboard') renderDashboard();
}

function addMember(e) {
  e.preventDefault();
  const member = {
    id: Date.now(), name: document.getElementById('m-name').value.trim(),
    phone: document.getElementById('m-phone').value.trim(),
    email: document.getElementById('m-email').value.trim(),
    type: 'dropin', expiry: null
  };
  state.members.push(member);
  saveState();
  closeModal('add-member-modal');
  e.target.reset();
  toast(`${member.name} added`);
  renderMembers();
  if (currentPage === 'dashboard') renderDashboard();
}

/* ── Purchase (Monthly / Drop-in) ────────────────── */
function purchasePlan(e) {
  e.preventDefault();
  const memberId = parseInt(document.getElementById('bs-member').value);
  const type     = document.getElementById('bs-type').value;
  const amount   = parseFloat(document.getElementById('bs-amount').value);
  const date     = document.getElementById('bs-date').value;

  const member = state.members.find(m => m.id === memberId);
  if (!member) return;

  if (type === 'monthly') {
    member.type = 'monthly';
    const exp = new Date(date); exp.setDate(exp.getDate() + 30);
    member.expiry = exp.toISOString().split('T')[0];
  }

  state.payments.push({
    id: Date.now(), memberId, memberName: member.name,
    amount, desc: type === 'monthly' ? 'Monthly' : 'Drop-in',
    type, date
  });

  state.rates[type] = amount;
  saveState();
  closeModal('buy-sessions-modal');
  document.getElementById('buy-sessions-form').reset();
  toast(`${type === 'monthly' ? 'Monthly' : 'Drop-in'} purchase recorded`);
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'members') renderMembers();
  if (currentPage === 'payments') renderPayments();
}

function updatePurchaseTotal() {
  const type = document.getElementById('bs-type').value;
  if (state.rates[type]) document.getElementById('bs-amount').value = state.rates[type];
}

/* ── Classes ─────────────────────────────────────── */
let selectedDay = DAYS[new Date().getDay()];

function renderClasses() {
  const picker = document.getElementById('day-picker');
  picker.innerHTML = DAYS.map(d => `
    <button class="day-pill${d === selectedDay ? ' active' : ''}" onclick="selectDay('${d}', this)">${d}</button>
  `).join('');
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
  return `
    <div class="class-card">
      <div class="class-time-block">
        <div class="class-time">${h12}</div>
        <div class="class-dur">${ampm} · ${c.duration}m</div>
      </div>
      <div class="class-info">
        <div class="class-name">${c.name}</div>
        <div class="class-instructor">👤 ${c.instructor}</div>
      </div>
      <div class="class-actions">
        <span class="badge badge-blue">${c.capacity} spots</span>
        <button class="delete-class-btn" onclick="deleteClass(${c.id})" title="Delete class">✕</button>
      </div>
    </div>`;
}

function deleteClass(id) {
  state.classes = state.classes.filter(c => c.id !== id);
  saveState();
  toast('Class removed');
  renderClassList();
  if (currentPage === 'dashboard') renderDashboard();
}

function addClass(e) {
  e.preventDefault();
  const cls = {
    id: Date.now(), name: document.getElementById('c-name').value.trim(),
    instructor: document.getElementById('c-instructor').value.trim(),
    day: document.getElementById('c-day').value, time: document.getElementById('c-time').value,
    duration: parseInt(document.getElementById('c-duration').value),
    capacity: parseInt(document.getElementById('c-capacity').value)
  };
  state.classes.push(cls);
  saveState();
  closeModal('add-class-modal');
  e.target.reset();
  toast(`${cls.name} added`);
  renderClasses();
  if (currentPage === 'dashboard') renderDashboard();
}

/* ── Payments ────────────────────────────────────── */
function renderPayments() {
  document.getElementById('monthly-revenue').textContent = '$' + monthRevenue();
  const sorted = [...state.payments].sort((a, b) => b.date.localeCompare(a.date));
  const el = document.getElementById('payments-list');
  if (sorted.length === 0) { el.innerHTML = emptyState('No payments recorded'); return; }
  el.innerHTML = sorted.map(p => `
    <div class="list-item">
      <div class="avatar" style="background:${avatarBg(p.memberName)}">${initials(p.memberName)}</div>
      <div class="item-info">
        <div class="item-title">${p.memberName}</div>
        <div class="item-sub">${p.desc || '—'} · ${formatDate(p.date)}</div>
      </div>
      <div class="item-right">
        <div style="font-weight:700;color:var(--accent-green)">$${p.amount.toFixed(2)}</div>
      </div>
    </div>`).join('');
}

function addPayment(e) {
  e.preventDefault();
  const memberId = parseInt(document.getElementById('p-member').value);
  const member = state.members.find(m => m.id === memberId);
  const payment = {
    id: Date.now(), memberId, memberName: member ? member.name : 'Unknown',
    amount: parseFloat(document.getElementById('p-amount').value),
    desc: document.getElementById('p-desc').value.trim() || 'Payment',
    type: 'other', date: document.getElementById('p-date').value
  };
  state.payments.push(payment);
  saveState();
  closeModal('add-payment-modal');
  document.getElementById('add-payment-form').reset();
  toast('Payment recorded');
  renderPayments();
  if (currentPage === 'dashboard') renderDashboard();
}

/* ── Expenses ────────────────────────────────────── */
function renderExpenses() {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthTotal = state.expenses
    .filter(e => e.date.startsWith(thisMonth))
    .reduce((s, e) => s + e.amount, 0);
  document.getElementById('monthly-expenses').textContent = '$' + monthTotal.toFixed(0);

  const sorted = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date));
  const el = document.getElementById('expenses-list');
  if (sorted.length === 0) { el.innerHTML = emptyState('No expenses recorded'); return; }

  const catColors = { Rent:'var(--accent-purple)', Utilities:'var(--accent-orange)', Equipment:'var(--accent-blue)', Salaries:'var(--accent-green)', Maintenance:'#4fd1c5', Marketing:'#f6ad55', Other:'var(--text-muted)' };
  el.innerHTML = sorted.map(e => `
    <div class="list-item">
      <div class="avatar" style="background:${catColors[e.category]||'var(--surface2)'}; color:#fff; font-size:11px;">${e.category.slice(0,3)}</div>
      <div class="item-info">
        <div class="item-title">${e.desc}</div>
        <div class="item-sub">${e.category} · ${formatDate(e.date)}</div>
      </div>
      <div class="item-right">
        <div style="font-weight:700;color:var(--accent-red)">-$${e.amount.toFixed(2)}</div>
      </div>
    </div>`).join('');
}

function addExpense(e) {
  e.preventDefault();
  const expense = {
    id: Date.now(),
    desc: document.getElementById('e-desc').value.trim(),
    category: document.getElementById('e-category').value,
    amount: parseFloat(document.getElementById('e-amount').value),
    date: document.getElementById('e-date').value
  };
  state.expenses.push(expense);
  saveState();
  closeModal('add-expense-modal');
  document.getElementById('add-expense-form').reset();
  toast('Expense added');
  renderExpenses();
  if (currentPage === 'dashboard') renderDashboard();
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
  if (id === 'add-expense-modal') {
    document.getElementById('e-date').value = today;
  }
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOnOverlay(e, id) { if (e.target.id === id) closeModal(id); }

/* ── Helpers ─────────────────────────────────────── */
function initials(name) { return (name||'?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2); }

const COLORS = ['#1e3a5f','#1a3a2e','#3a1a2e','#2e2a1a','#1a2a3e','#2a1a3e'];
function avatarBg(name) {
  let h = 0;
  for (let i = 0; i < (name||'').length; i++) h = name.charCodeAt(i) + ((h<<5)-h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return ((h % 12) || 12) + ':' + String(m).padStart(2,'0') + ' ' + ampm;
}

function emptyState(msg) {
  return `<div class="empty-state">
    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
    <p>${msg}</p>
  </div>`;
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ── Init ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker for PWA install
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  renderDashboard();
});
