from typing import List, Dict, Any
from app.schemas.schema_design import SchemaDesign

def validate_schema(schema: SchemaDesign) -> Dict[str, List[str]]:
    """
    Validates a SchemaDesign and returns safe errors and warnings.
    """
    errors = []
    warnings = []
    
    table_names = set()
    table_ids = set()
    
    for t in schema.tables:
        table_ids.add(t.id)
        if t.name.lower() in table_names:
            errors.append(f"Duplicate table name found: {t.name}")
        table_names.add(t.name.lower())
        
        has_pk = any(c.key == "PK" for c in t.columns)
        if not has_pk:
            warnings.append(f"Table '{t.name}' has no Primary Key. Searching records might be slow or unstable.")
            
        if not t.columns:
            errors.append(f"Table '{t.name}' must have at least one column.")
            
    for rel in schema.relationships:
        if rel.sourceTableId not in table_ids:
            errors.append(f"Relationship refers to an unknown source table.")
        if rel.targetTableId not in table_ids:
            errors.append(f"Relationship refers to an unknown target table.")
            
    return {"errors": errors, "warnings": warnings}
