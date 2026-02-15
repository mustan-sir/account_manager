from pydantic import BaseModel


class ImportJobRead(BaseModel):
    id: int
    source_name: str
    import_type: str
    status: str
    message: str | None = None

    model_config = {"from_attributes": True}
