"""
Simple Chat Manager that maintains conversation history with configurable limit.
Keeps only the last N exchanges to optimize speed and cost.
"""

class ChatManager:
    def __init__(self, history_limit=2):
        """
        Initialize chat manager.
        
        Args:
            history_limit: Number of previous exchanges (user+assistant pairs) to keep
        """
        self.system_msg = {
            "role": "system", 
            "content": "You are a database schema generator. Respond ONLY with valid JSON. DO NOT think or explain your reasoning. Output JSON immediately. DO NOT use <think> tags or markdown code blocks."
        }
        self.messages = [self.system_msg]
        self.history_limit = history_limit
        self.full_history = []  # Optional: store complete history for logging
    
    async def send_query(self, user_query, llm_response_func):
        """
        Send a query and get response while managing history.
        
        Args:
            user_query: User's question/message
            llm_response_func: Async function that takes messages and returns LLM response
            
        Returns:
            LLM response text
        """
        # Add user message
        user_msg = {"role": "user", "content": user_query}
        self.messages.append(user_msg)
        self.full_history.append(user_msg)
        
        # Get LLM response (await if async)
        response_text = await llm_response_func(self.messages)
        
        # Add assistant response
        assistant_msg = {"role": "assistant", "content": response_text}
        self.messages.append(assistant_msg)
        self.full_history.append(assistant_msg)
        
        # Trim history: keep system + last N exchanges
        max_messages = 1 + (self.history_limit * 2)
        if len(self.messages) > max_messages:
            self.messages = [self.system_msg] + self.messages[-(self.history_limit * 2):]
        
        return response_text
    
    def get_current_context(self):
        """Get current messages being sent to LLM"""
        return self.messages
    
    def get_full_history(self):
        """Get complete conversation history"""
        return self.full_history
    
    def reset(self):
        """Reset conversation"""
        self.messages = [self.system_msg]
        self.full_history = []
