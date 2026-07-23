from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.models.incident import Incident, IncidentStatus, HazardType, SeverityLevel
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

# Incident schemas
class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    hazard_type: HazardType
    severity: SeverityLevel = SeverityLevel.MODERATE
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_area: Optional[str] = None
    affected_population: Optional[int] = None
    casualties: Optional[int] = None
    missing_persons: Optional[int] = None
    reporting_source: Optional[str] = None
    source_reference: Optional[str] = None
    department_id: Optional[int] = None

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    hazard_type: Optional[HazardType] = None
    severity: Optional[SeverityLevel] = None
    status: Optional[IncidentStatus] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_area: Optional[str] = None
    affected_population: Optional[int] = None
    casualties: Optional[int] = None
    missing_persons: Optional[int] = None
    incident_commander_id: Optional[int] = None
    verification_status: Optional[str] = None

class IncidentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    hazard_type: HazardType
    status: IncidentStatus
    severity: SeverityLevel
    location_name: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    affected_area: Optional[str]
    affected_population: Optional[int]
    casualties: Optional[int]
    missing_persons: Optional[int]
    reporting_source: Optional[str]
    source_reference: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: int
    incident_commander_id: Optional[int]
    verification_status: str
    data_source: str = "source_data"
    source_page: Optional[int] = None

@router.get("/", response_model=List[IncidentResponse])
async def list_incidents(
    skip: int = 0,
    limit: int = 100,
    status: Optional[IncidentStatus] = None,
    hazard_type: Optional[HazardType] = None,
    severity: Optional[SeverityLevel] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Incident)
    
    if status:
        query = query.filter(Incident.status == status)
    if hazard_type:
        query = query.filter(Incident.hazard_type == hazard_type)
    if severity:
        query = query.filter(Incident.severity == severity)
    if department_id:
        query = query.filter(Incident.department_id == department_id)
    
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/", response_model=IncidentResponse)
async def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_incident = Incident(
        id=str(uuid.uuid4()),
        title=incident.title,
        description=incident.description,
        hazard_type=incident.hazard_type,
        severity=incident.severity,
        status=IncidentStatus.DRAFT,
        location_name=incident.location_name,
        latitude=incident.latitude,
        longitude=incident.longitude,
        affected_area=incident.affected_area,
        affected_population=incident.affected_population,
        casualties=incident.casualties,
        missing_persons=incident.missing_persons,
        reporting_source=incident.reporting_source,
        source_reference=incident.source_reference,
        department_id=incident.department_id,
        created_by=current_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        verification_status="pending",
        data_source="operational_data"
    )
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    
    return db_incident

@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    incident_update: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update fields
    update_data = incident_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_incident, field, value)
    
    db_incident.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_incident)
    
    return db_incident

@router.post("/{incident_id}/verify")
async def verify_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if user has verification permissions
    user_roles = [role.name for role in current_user.roles]
    if not any(role in ["System Administrator", "DDMA Administrator", "Incident Commander"] for role in user_roles):
        raise HTTPException(status_code=403, detail="Insufficient permissions to verify incidents")
    
    db_incident.verification_status = "verified"
    db_incident.verified_by = current_user.id
    db_incident.verified_at = datetime.now(timezone.utc)
    db_incident.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_incident)
    
    return {"message": "Incident verified successfully", "incident_id": incident_id}

@router.post("/{incident_id}/activate")
async def activate_incident(
    incident_id: str,
    activation_level: int = Query(ge=1, le=3, description="Activation level (1-3)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if user has activation permissions
    user_roles = [role.name for role in current_user.roles]
    if not any(role in ["System Administrator", "DDMA Administrator", "Incident Commander"] for role in user_roles):
        raise HTTPException(status_code=403, detail="Insufficient permissions to activate incidents")
    
    if db_incident.verification_status != "verified":
        raise HTTPException(status_code=400, detail="Incident must be verified before activation")
    
    db_incident.status = IncidentStatus.ACTIVATED
    db_incident.activation_level = activation_level
    db_incident.activated_by = current_user.id
    db_incident.activated_at = datetime.now(timezone.utc)
    db_incident.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_incident)
    
    return {"message": "Incident activated successfully", "incident_id": incident_id, "activation_level": activation_level}

@router.get("/stats/summary")
async def get_incident_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get incident counts by status
    status_counts = db.query(
        Incident.status, func.count(Incident.id)
    ).group_by(Incident.status).all()
    
    # Get incident counts by hazard type
    hazard_counts = db.query(
        Incident.hazard_type, func.count(Incident.id)
    ).group_by(Incident.hazard_type).all()
    
    # Get total affected population
    total_affected = db.query(func.sum(Incident.affected_population)).scalar() or 0
    
    # Get total casualties
    total_casualties = db.query(func.sum(Incident.casualties)).scalar() or 0
    
    # Get active incidents
    active_incidents = db.query(Incident).filter(
        Incident.status.in_([
            IncidentStatus.ACTIVATED,
            IncidentStatus.RESPONSE_UNDERWAY,
            IncidentStatus.STABILISED
        ])
    ).count()
    
    return {
        "status_counts": {status: count for status, count in status_counts},
        "hazard_counts": {hazard: count for hazard, count in hazard_counts},
        "total_affected_population": total_affected,
        "total_casualties": total_casualties,
        "active_incidents": active_incidents,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
