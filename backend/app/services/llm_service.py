import httpx
import re
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def generate_completion(prompt: str) -> str:
    system_prompt = (
<<<<<<< HEAD
        "You are a database schema generator. Respond ONLY with valid JSON.\n"
        "DO NOT think or explain your reasoning. Output JSON immediately.\n"
        "DO NOT use <think> tags or markdown code blocks."
=======
        "You are QueryNest AI Database Architect.\n"
        "You MUST respond STRICTLY in raw valid JSON exactly matching the requested shape.\n"
        "Do NOT include markdown formatting wrappers like ```json at the start or end.\n"
        "Be concise and respond quickly."
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
    )
    
    payload = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
<<<<<<< HEAD
        "temperature": 0.1,
        "max_tokens": 3000,
        "top_p": 0.9
=======
        "temperature": 0.2,
        "max_tokens": 2000
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
    }
    
    logger.info(f"Calling LLM API: {settings.LLM_API_URL}")
    logger.debug(f"Payload: {payload}")
    
    content = ""
    try:
<<<<<<< HEAD
        async with httpx.AsyncClient(timeout=180.0) as client:
=======
        async with httpx.AsyncClient(timeout=120.0) as client:
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
            response = await client.post(
                settings.LLM_API_URL, 
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            logger.debug(f"LLM response status: {response.status_code}")
            
            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"]
<<<<<<< HEAD
                logger.debug(f"Raw LLM response content: {content[:500]}...")
=======
                logger.debug(f"Raw LLM response content: {content!r}")
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
            else:
                logger.error(f"Unexpected LLM response structure: {data}")
                raise ValueError(f"Unexpected LLM response format: {data}")

<<<<<<< HEAD
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
=======
            # Strip Qwen3 <think>...</think> reasoning blocks
            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd

            # Strip markdown code fences
            if content.startswith("```json"):
                content = content[7:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()
            elif content.startswith("```"):
                content = content[3:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()

<<<<<<< HEAD
            logger.debug(f"Cleaned LLM content: {content[:200]}...")
=======
            logger.debug(f"Cleaned LLM content: {content!r}")
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd

            if not content:
                logger.error("LLM returned empty content after cleaning")
                raise ValueError("LLM returned empty content")

        return content
    except httpx.ReadTimeout:
<<<<<<< HEAD
        logger.error(f"LLM API timeout after 180s. Model: {settings.MODEL_NAME}")
        logger.error(f"This may indicate the model is overloaded or thinking mode is enabled.")
        raise ValueError("LLM API request timed out. Try again or check model availability.")
=======
        logger.error(f"LLM API timeout after 120s")
        raise ValueError("LLM API request timed out. The model may be overloaded.")
>>>>>>> a463491a0e31a80eefcdf3f7b956c561848067dd
    except httpx.HTTPError as e:
        logger.error(f"HTTP error calling LLM API: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error in LLM service: {str(e)}")
        raise
