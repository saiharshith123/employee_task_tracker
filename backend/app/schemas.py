from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from .models import TaskStatus

class EmployeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    department: str = Field(min_length=1, max_length=120)

class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    department: str

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: str = "Medium"
    due_date: date | None = None
    employee_id: int

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None
    priority: str
    due_date: date | None
    status: TaskStatus
    employee_id: int
    employee_name: str
    created_at: datetime

class DashboardOut(BaseModel):
    total_employees: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
