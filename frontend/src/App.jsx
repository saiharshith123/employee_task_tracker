import { useCallback, useEffect, useState } from 'react';

const API = 'http://127.0.0.1:8000';
async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.detail || message; } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState({ total_employees: 0, total_tasks: 0, completed_tasks: 0, pending_tasks: 0 });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', department: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', due_date: '', employee_id: '' });
  const [statusFilter, setStatusFilter] = useState('All');

  const refresh = useCallback(async () => {
    try {
      const [e, t, d] = await Promise.all([request('/employees'), request('/tasks'), request('/dashboard')]);
      setEmployees(e); setTasks(t); setDashboard(d);
      setTaskForm(old => ({ ...old, employee_id: old.employee_id || (e[0] ? String(e[0].id) : '') }));
      setError('');
    } catch (err) { setError(`${err.message}. Check that the FastAPI server and PostgreSQL are running.`); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function submitEmployee(event) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      await request('/employees', { method: 'POST', body: JSON.stringify(employeeForm) });
      setEmployeeForm({ name: '', email: '', department: '' }); setNotice('Employee added successfully.'); await refresh();
    } catch (err) { setError(err.message); }
  }
  async function deleteEmployee(id) {
    if (!window.confirm('Delete this employee and their assigned tasks?')) return;
    try { await request(`/employees/${id}`, { method: 'DELETE' }); setNotice('Employee deleted.'); await refresh(); }
    catch (err) { setError(err.message); }
  }
  async function submitTask(event) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      await request('/tasks', { method: 'POST', body: JSON.stringify({ ...taskForm, employee_id: Number(taskForm.employee_id), due_date: taskForm.due_date || null }) });
      setTaskForm(old => ({ ...old, title: '', description: '', priority: 'Medium', due_date: '' }));
      setNotice('Task created successfully.'); await refresh();
    } catch (err) { setError(err.message); }
  }
  async function changeStatus(id, status) {
    try { await request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await refresh(); }
    catch (err) { setError(err.message); }
  }

  const visibleTasks = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter);

  return <main className="shell">
    <header className="topbar">
      <div><div className="eyebrow">TEAM WORKSPACE</div><h1>Employee Task Tracker</h1><p>Manage your people, assignments, and progress in one place.</p></div>
      <div className="live"><span /> PostgreSQL connected through API</div>
    </header>
    {error && <div className="alert error">{error}</div>}
    {notice && <div className="alert success">{notice}</div>}
    <section className="stats">
      <Stat label="Total employees" value={dashboard.total_employees} detail="Team members" symbol="♙" />
      <Stat label="Total tasks" value={dashboard.total_tasks} detail="All assignments" symbol="▤" />
      <Stat label="Completed" value={dashboard.completed_tasks} detail="Finished tasks" symbol="✓" />
      <Stat label="Pending" value={dashboard.pending_tasks} detail="Awaiting action" symbol="◷" />
    </section>
    <section className="grid">
      <div className="panel">
        <div className="panel-heading"><div><div className="eyebrow">PEOPLE</div><h2>Add employee</h2></div><span className="icon">＋</span></div>
        <form onSubmit={submitEmployee} className="form">
          <label>Full name<input required maxLength="120" placeholder="e.g. Priya Sharma" value={employeeForm.name} onChange={e=>setEmployeeForm({...employeeForm,name:e.target.value})}/></label>
          <label>Email address<input required type="email" placeholder="name@company.com" value={employeeForm.email} onChange={e=>setEmployeeForm({...employeeForm,email:e.target.value})}/></label>
          <label>Department<input required placeholder="e.g. Engineering" value={employeeForm.department} onChange={e=>setEmployeeForm({...employeeForm,department:e.target.value})}/></label>
          <button className="primary" type="submit">＋ Add employee</button>
        </form>
      </div>
      <div className="panel">
        <div className="panel-heading"><div><div className="eyebrow">ASSIGNMENTS</div><h2>Create task</h2></div><span className="icon">▤</span></div>
        <form onSubmit={submitTask} className="form">
          <label>Task title<input required maxLength="200" placeholder="What needs to be done?" value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})}/></label>
          <label>Description<textarea rows="2" placeholder="Add a few details (optional)" value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})}/></label>
          <div className="form-row">
            <label>Priority<select value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label>Due date<input type="date" value={taskForm.due_date} onChange={e=>setTaskForm({...taskForm,due_date:e.target.value})}/></label>
          </div>
          <label>Assign to<select required value={taskForm.employee_id} onChange={e=>setTaskForm({...taskForm,employee_id:e.target.value})}><option value="">Select an employee</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}</select></label>
          <button className="primary" type="submit" disabled={!employees.length}>＋ Create task</button>
          {!employees.length && <small>Add an employee before creating a task.</small>}
        </form>
      </div>
    </section>
    <section className="panel list-panel">
      <div className="panel-heading list-heading"><div><div className="eyebrow">DIRECTORY</div><h2>Employees <span className="count">{employees.length}</span></h2></div></div>
      {employees.length === 0 ? <Empty text="No employees yet. Add your first team member above."/> :
        <div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>EMAIL</th><th></th></tr></thead><tbody>
        {employees.map(e=><tr key={e.id}><td><div className="person"><span className="avatar">{e.name.trim().charAt(0).toUpperCase()}</span><strong>{e.name}</strong></div></td><td>{e.department}</td><td className="muted">{e.email}</td><td className="right"><button className="danger-link" onClick={()=>deleteEmployee(e.id)}>Delete</button></td></tr>)}
        </tbody></table></div>}
    </section>
    <section className="panel list-panel">
      <div className="panel-heading list-heading"><div><div className="eyebrow">WORK QUEUE</div><h2>Tasks <span className="count">{visibleTasks.length}</span></h2></div>
        <select className="filter" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option></select>
      </div>
      {visibleTasks.length === 0 ? <Empty text="No tasks match this view. Create a task above to get started."/> :
      <div className="table-wrap"><table><thead><tr><th>TASK</th><th>ASSIGNED TO</th><th>PRIORITY</th><th>DUE DATE</th><th>STATUS</th></tr></thead><tbody>
      {visibleTasks.map(t=><tr key={t.id}><td><strong>{t.title}</strong>{t.description && <div className="task-description">{t.description}</div>}</td><td><div className="person"><span className="avatar small">{t.employee_name.charAt(0).toUpperCase()}</span>{t.employee_name}</div></td><td><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span></td><td className="muted">{t.due_date || '—'}</td><td><select className={`status ${t.status === 'Completed' ? 'done' : t.status === 'In Progress' ? 'progress' : 'pending'}`} value={t.status} onChange={e=>changeStatus(t.id,e.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select></td></tr>)}
      </tbody></table></div>}
    </section>
    <footer>Employee Task Tracker <span>•</span> React + FastAPI + PostgreSQL</footer>
  </main>;
}

function Stat({label,value,detail,symbol}) { return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-symbol">{symbol}</span></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></article>; }
function Empty({text}) { return <div className="empty"><span>◇</span><p>{text}</p></div>; }
