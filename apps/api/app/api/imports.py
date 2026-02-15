from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.imports import ImportJobRead
from app.services.csv_import import process_csv_import

router = APIRouter(prefix="", tags=["imports"])


@router.post("/imports/csv", response_model=ImportJobRead)
async def import_csv(
    file: UploadFile = File(...),
    import_type: str = Form(...),
    source_name: str = Form(default="manual_upload"),
    db: Session = Depends(get_db),
):
    payload = await file.read()
    return process_csv_import(db=db, content=payload, import_type=import_type, source_name=source_name)
