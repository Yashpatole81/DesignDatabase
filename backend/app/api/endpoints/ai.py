from fastapi import APIRouter, HTTPException
from app.schemas.schema_design import GenerateSchemaRequest, AIOutputResponse, SchemaDesign
from app.services.llm_service import generate_completion
from app.services.validation_service import validate_schema
from app.services.sql_service import generate_sql
import json
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate-schema", response_model=AIOutputResponse)
async def generate_schema(payload: GenerateSchemaRequest):
    current_schema_str = payload.schema_design.model_dump_json(indent=2)
    prompt = f"""
Current database schema:
{current_schema_str}

User request: "{payload.prompt}"

You are an AI Database Architect. 
If the user's request is a greeting or general conversational message (e.g., "hi", "how are you?"), respond politely in the 'explanation' field and keep the 'tables' and 'relationships' arrays as they are (or empty if creating from scratch).

If the user is asking for schema changes:
1. Modify or expand the table schema.
2. Provide a brief, natural explanation of the changes in the 'explanation' field.

Return ONLY JSON matching this format:
{{
    "tables": [{{ "id": "str", "name": "str", "columns": [{{ "id": "str", "name": "str", "type": "str", "key": "PK" }}], "position": {{ "x": 0, "y": 0 }} }}],
    "relationships": [{{ "id": "str", "sourceTableId": "str", "targetTableId": "str", "sourceColumnId": "str", "targetColumnId": "str" }}],
    "explanation": "Your natural language response here"
}}
"""
    try:
        raw_json = await generate_completion(prompt)
        parsed = json.loads(raw_json)
        
        # Safe fallback for physical node position attributes
        for t in parsed.get("tables", []):
            if "position" not in t or not t["position"]:
                t["position"] = {"x": 100.0, "y": 100.0}

        new_schema = SchemaDesign(**parsed)
        val_result = validate_schema(new_schema)
        sql_stmts = generate_sql(new_schema)
        
        logger.info(f"Generated {len(sql_stmts)} SQL statements for {len(new_schema.tables)} tables")
        
        # Use LLM explanation if provided, otherwise fallback to default
        explanation = parsed.get("explanation", f"Generated updates for {len(new_schema.tables)} tables.")
        
        return AIOutputResponse(
            tables=new_schema.tables,
            relationships=new_schema.relationships,
            sql=sql_stmts,
            explanation=explanation,
            warnings=val_result["warnings"] + val_result["errors"]
        )
    except json.JSONDecodeError as jde:
        logger.error(f"LLM returned invalid JSON: {str(jde)}")
        raise HTTPException(status_code=500, detail=f"LLM did not return valid JSON. Error: {str(jde)}")
    except Exception as e:
        logger.error(f"Schema generation failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"LLM Generation pipeline failed: {str(e)}")
