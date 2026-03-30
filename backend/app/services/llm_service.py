import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def generate_completion(prompt: str) -> str:
    system_prompt = (
        "You are QueryNest AI Database Architect.\n"
        "You MUST respond STRICTLY in raw valid JSON exactly matching the requested shape.\n"
        "Do NOT include markdown formatting wrappers like ```json at the start or end."
    )
    
    payload = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    
    logger.info(f"Calling LLM API: {settings.LLM_API_URL}")
    logger.debug(f"Model: {settings.MODEL_NAME}")
    
    content = ""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.LLM_API_URL, 
                json=payload,
                timeout=120.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"]
            else:
                raise ValueError(f"Unexpected LLM response format: {data}")
                
            # Clean potential LLM formatting artifacts
            if content.startswith("```json"):
                content = content.strip()[7:-3].strip()
            elif content.startswith("```"):
                content = content.strip()[3:-3].strip()
                
        return content
    except httpx.HTTPError as e:
        logger.error(f"HTTP error calling LLM API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error in LLM service: {str(e)}")
        raise
