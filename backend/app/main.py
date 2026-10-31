from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from .database import Base, engine, get_db
from .models import Employee, Task, TaskStatus
from .schemas import EmployeeCreate, EmployeeOut, TaskCreate, TaskOut, TaskStatusUpdate, DashboardOut

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Employee Task Tracker API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Employee Task Tracker API is running", "docs": "/docs"}

@app.get("/employees", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(Employee).order_by(Employee.id.desc()).all()

@app.post("/employees", response_model=EmployeeOut, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    employee = Employee(**payload.model_dump())
    db.add(employee)
    try:
        db.commit()
        db.refresh(employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An employee with this email already exists.")
    return employee

@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    db.delete(employee)
    db.commit()
    return None

def task_to_out(task: Task):
    return {
        "id": task.id, "title": task.title, "description": task.description,
        "priority": task.priority, "due_date": task.due_date, "status": task.status,
        "employee_id": task.employee_id, "employee_name": task.employee.name,
        "created_at": task.created_at,
    }

@app.get("/tasks", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).options(joinedload(Task.employee)).order_by(Task.id.desc()).all()
    return [task_to_out(t) for t in tasks]

@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    employee = db.get(Employee, payload.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Selected employee does not exist.")
    if payload.priority not in {"Low", "Medium", "High"}:
        raise HTTPException(status_code=422, detail="Priority must be Low, Medium, or High.")
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    task = db.query(Task).options(joinedload(Task.employee)).filter(Task.id == task.id).one()
    return task_to_out(task)

@app.patch("/tasks/{task_id}/status", response_model=TaskOut)
def update_task_status(task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).options(joinedload(Task.employee)).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task_to_out(task)

@app.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    return {
        "total_employees": db.query(func.count(Employee.id)).scalar() or 0,
        "total_tasks": db.query(func.count(Task.id)).scalar() or 0,
        "completed_tasks": db.query(func.count(Task.id)).filter(Task.status == TaskStatus.COMPLETED).scalar() or 0,
        "pending_tasks": db.query(func.count(Task.id)).filter(Task.status == TaskStatus.PENDING).scalar() or 0,
    }
