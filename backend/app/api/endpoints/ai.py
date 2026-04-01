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
Current schema:
{current_schema_str}

User: "{payload.prompt}"

Generate database schema. For 'key' field use: "PK", "FK", "UNIQUE", or "NONE" (not empty string).

Return JSON:
{{
    "tables": [{{"id": "str", "name": "str", "columns": [{{"id": "str", "name": "str", "type": "str", "key": "NONE"}}], "position": {{"x": 0, "y": 0}}}}],
    "relationships": [],
    "explanation": "Brief explanation"
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
        logger.error(f"Offending content: {raw_json!r}")
        raise HTTPException(status_code=500, detail=f"LLM did not return valid JSON. Error: {str(jde)}")
    except Exception as e:
        logger.error(f"Schema generation failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"LLM Generation pipeline failed: {str(e)}")
