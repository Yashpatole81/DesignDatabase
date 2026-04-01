import httpx
import re
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def generate_completion(prompt: str) -> str:
    system_prompt = (
        "You are a database schema generator. Respond ONLY with valid JSON.\n"
        "DO NOT think or explain your reasoning. Output JSON immediately.\n"
        "DO NOT use <think> tags or markdown code blocks."
    )
    
    payload = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 3000,
        "top_p": 0.9
    }
    
    logger.info(f"Calling LLM API: {settings.LLM_API_URL}")
    logger.debug(f"Payload: {payload}")
    
    content = ""
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                settings.LLM_API_URL, 
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            logger.debug(f"LLM response status: {response.status_code}")
            
            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"]
                logger.debug(f"Raw LLM response content: {content[:500]}...")
            else:
                logger.error(f"Unexpected LLM response structure: {data}")
                raise ValueError(f"Unexpected LLM response format: {data}")

            # Strip Qwen3 <think>...</think> reasoning blocks (handle incomplete closing tags)
            if "<think>" in content:
                # Find the end of think block or start of JSON
                think_start = content.find("<think>")
                # Look for closing tag or JSON start
                think_end = content.find("</think>")
                if think_end != -1:
                    content = content[:think_start] + content[think_end + 8:]
                else:
                    # No closing tag, find JSON start
                    json_start = content.find("{")
                    if json_start != -1:
                        content = content[json_start:]
                    else:
                        content = ""
                content = content.strip()

            # Strip markdown code fences
            if content.startswith("```json"):
                content = content[7:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()
            elif content.startswith("```"):
                content = content[3:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()

            logger.debug(f"Cleaned LLM content: {content[:200]}...")

            if not content:
                logger.error("LLM returned empty content after cleaning")
                raise ValueError("LLM returned empty content")

        return content
    except httpx.ReadTimeout:
        logger.error(f"LLM API timeout after 180s. Model: {settings.MODEL_NAME}")
        logger.error(f"This may indicate the model is overloaded or thinking mode is enabled.")
        raise ValueError("LLM API request timed out. Try again or check model availability.")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error calling LLM API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error in LLM service: {str(e)}")
        raise
