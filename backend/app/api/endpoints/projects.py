from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter()

# In-memory store
_projects: dict[str, dict] = {}

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    pid = str(uuid.uuid4())
    _projects[pid] = {"id": pid, "name": project.name, "db_type": project.db_type}
    return _projects[pid]

@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    return list(_projects.values())

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    if project_id not in _projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return _projects[project_id]

@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str):
    if project_id not in _projects:
        raise HTTPException(status_code=404, detail="Project not found")
    del _projects[project_id]
