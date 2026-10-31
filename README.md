#🧑‍💼 Employee Task Tracker

A full-stack web application for managing employees, assigning tasks, and monitoring task progress. The frontend uses React and Vite, the backend uses FastAPI, and PostgreSQL stores application data.

##✨ Features

- Add employees with name, email, and department.
- View the employee directory and delete employees when allowed by task-assignment rules.
- Create tasks with title, description, priority, due date, and assigned employee.
- View tasks and update task status.
- Search and filter tasks where supported by the UI.
- View dashboard totals for employees, tasks, completed tasks, and pending tasks.
- Use FastAPI's interactive API documentation to inspect and test endpoints.

##🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, JavaScript, Vite, CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | PostgreSQL |
| Database access | SQLAlchemy, Psycopg |
| API documentation | FastAPI / Swagger UI |

##📁 Project Structure

```text
employee_task_tracker/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

*The exact filenames may vary slightly depending on your local version of the project.*

##⚙️ Prerequisites

Install the following:

- Python 3.10 or later
- Node.js and npm
- PostgreSQL
- Visual Studio Code or another code editor

##🗄️ 1. Configure PostgreSQL

Start PostgreSQL and create a database and user. For example, in `psql` or pgAdmin, run the following SQL, adapting credentials to your environment:

```sql
CREATE USER task_user WITH PASSWORD 'replace_with_a_strong_password';
CREATE DATABASE employee_task_tracker OWNER task_user;
```

If the database or user already exists, do not run the corresponding creation command again. Use your existing credentials instead.

## 2. Set Up the Backend

Open a terminal in the project root:

```powershell
cd backend
```

Create and activate a virtual environment on Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install Python dependencies:

```powershell
pip install -r requirements.txt
```

Create a `.env` file inside `backend` using `.env.example` as a guide. Configure the database URL to match your PostgreSQL credentials:

```env
DATABASE_URL=postgresql+psycopg://task_user:replace_with_a_strong_password@localhost:5432/employee_task_tracker
```

Do not commit your real `.env` file or database password to GitHub.

###🚀 Start FastAPI

From the `backend` directory, run:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep this terminal open while using the application.

- API base URL: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

The backend may create tables at startup if database initialization is configured to do so. Otherwise, apply the schema or migrations supplied by your project.

## 3. Set Up the Frontend

Open a **second terminal** in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, commonly:

```text
http://localhost:5173
```

The frontend's API base URL must match the backend address, usually:

```text
http://127.0.0.1:8000
```

If your frontend uses an environment variable for the API URL, use the variable name expected by the code. Restart Vite after changing environment variables.

## 4. Verify the Application

1. Confirm PostgreSQL is running.
2. Confirm FastAPI is listening on port `8000`.
3. Open `http://127.0.0.1:8000/docs`.
4. Test an available endpoint such as `/employees`.
5. Open the React frontend and add an employee.
6. Confirm the employee appears in the directory and remains after refreshing the page.

##🔌 API Endpoints

The frontend shown in this project requests the following routes:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/employees` | Retrieve employees |
| GET | `/tasks` | Retrieve tasks |
| GET | `/dashboard` | Retrieve dashboard statistics |

Create, update, and delete endpoints depend on the backend implementation. Check `http://127.0.0.1:8000/docs` for the routes and request schemas exposed by your running API.

## Troubleshooting

### `ERR_CONNECTION_REFUSED` for `/employees`, `/tasks`, or `/dashboard`

The browser cannot connect to the backend at the configured address and port.

- Start FastAPI and keep its terminal open.
- Visit `http://127.0.0.1:8000/docs` directly.
- Check whether port `8000` is listening:

  ```powershell
  netstat -ano | findstr :8000
  ```

- Ensure the frontend API URL matches the backend host and port.

### CORS errors in the browser

If the browser reports a CORS policy error, configure FastAPI's `CORSMiddleware` to allow your frontend origin, such as `http://localhost:5173` and, if needed, `http://127.0.0.1:5173`. Add the middleware only once and restart the backend.

###🗄️ PostgreSQL connection errors

- Confirm the PostgreSQL service is running.
- Verify the database name, username, password, host, and port in `backend/.env`.
- Ensure the database exists and the configured user has the required permissions.
- Do not publish database passwords in source control or screenshots.

### The frontend shows zero counts or “Failed to fetch”

The dashboard depends on API responses. Open browser Developer Tools with **F12**, inspect the **Network** and **Console** tabs, and check the failed request. Also inspect the FastAPI terminal for related errors.

###🛠️ Vite or npm errors

From the `frontend` directory, run:

```powershell
npm install
npm run dev
```

If Vite reports an invalid configuration, check `vite.config.js` and confirm it exports a valid configuration object.

##📋 Security Notes

- Store database credentials in a local `.env` file.
- Use a strong PostgreSQL password.
- Do not commit secrets, virtual environments, or `node_modules` to Git.
- Before deployment, configure production CORS origins, environment variables, HTTPS, and appropriate authentication and authorization.

##🌱  Future Improvements

- User login and role-based access control
- Task comments and activity history
- Notifications for approaching due dates
- Pagination and advanced filtering
- Automated backend and frontend tests
- Production deployment

##📄 License

This project is created for educational and portfolio purposes.
