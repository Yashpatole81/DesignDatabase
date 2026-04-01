import httpx
import re
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def generate_completion(prompt: str) -> str:
    system_prompt = (
        "You are QueryNest AI Database Architect.\n"
        "You MUST respond STRICTLY in raw valid JSON exactly matching the requested shape.\n"
        "Do NOT include markdown formatting wrappers like ```json at the start or end.\n"
        "Be concise and respond quickly."
    )
    
    payload = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 2000
    }
    
    logger.info(f"Calling LLM API: {settings.LLM_API_URL}")
    logger.debug(f"Model: {settings.MODEL_NAME}")
    
    content = ""
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                settings.LLM_API_URL, 
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"]
                logger.debug(f"Raw LLM response content: {content!r}")
            else:
                logger.error(f"Unexpected LLM response structure: {data}")
                raise ValueError(f"Unexpected LLM response format: {data}")

            # Strip Qwen3 <think>...</think> reasoning blocks
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

            # Strip markdown code fences
            if content.startswith("```json"):
                content = content[7:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()
            elif content.startswith("```"):
                content = content[3:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()

            logger.debug(f"Cleaned LLM content: {content!r}")

            if not content:
                logger.error("LLM returned empty content after cleaning")
                raise ValueError("LLM returned empty content")

        return content
    except httpx.ReadTimeout:
        logger.error(f"LLM API timeout after 120s")
        raise ValueError("LLM API request timed out. The model may be overloaded.")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error calling LLM API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error in LLM service: {str(e)}")
        raise
