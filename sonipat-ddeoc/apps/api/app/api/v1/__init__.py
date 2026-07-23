from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    incidents,
    resources,
    assessments,
    esf,
    reports,
    preparedness,
    relief,
    recovery,
    communication,
    gis,
    admin,
    health
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incident Management"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resource Inventory"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Damage Assessment"])
api_router.include_router(esf.router, prefix="/esf", tags=["Emergency Support Functions"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reporting"])
api_router.include_router(preparedness.router, prefix="/preparedness", tags=["Preparedness"])
api_router.include_router(relief.router, prefix="/relief", tags=["Relief Management"])
api_router.include_router(recovery.router, prefix="/recovery", tags=["Recovery"])
api_router.include_router(communication.router, prefix="/communication", tags=["Communication"])
api_router.include_router(gis.router, prefix="/gis", tags=["GIS Services"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(health.router, prefix="/health", tags=["Health Check"])
