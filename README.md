# Employee Task Tracker (React + FastAPI + PostgreSQL)

Implements the uploaded assignment: employee CRUD (add/list/delete), task creation and assignment, task status updates, and dashboard counts.

## Requirements
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (or compatible)

## 1. Create PostgreSQL database
Open `psql` or pgAdmin and run:
```sql
CREATE DATABASE employee_task_tracker;
```

## 2. Start the backend
Open a terminal in `employee_task_tracker/backend`:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```
Edit `.env` and set your PostgreSQL username/password:
```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/employee_task_tracker
```
Then start:
```powershell
uvicorn app.main:app --reload
```
Backend: http://127.0.0.1:8000  
Swagger API docs: http://127.0.0.1:8000/docs

If using Command Prompt rather than PowerShell, activate with `venv\Scripts\activate.bat` and copy `.env.example` to `.env` manually.

## 3. Start the React frontend
Open a second terminal in `employee_task_tracker/frontend`:
```powershell
npm install
npm run dev
```
Open the URL printed by Vite, usually http://localhost:5173.

## 4. Test the workflow
1. Add an employee (name, email, department).
2. Create a task and select the employee.
3. Change its status using the status dropdown.
4. Check dashboard totals.
5. Delete an employee to test employee deletion. The API deletes tasks assigned to that employee too.

## API endpoints
- `GET /employees` — list employees
- `POST /employees` — create employee
- `DELETE /employees/{id}` — delete employee and assigned tasks
- `GET /tasks` — list tasks with employee name
- `POST /tasks` — create task
- `PATCH /tasks/{id}/status` — update status
- `GET /dashboard` — summary counts

The tables are created automatically when the backend starts. Do not commit your real `.env` file to GitHub.
