"""
Session manager to maintain chat history per user session
"""

from chat_manager import ChatManager
from typing import Dict
import uuid

class SessionManager:
    def __init__(self):
        self.sessions: Dict[str, ChatManager] = {}
    
    def create_session(self, history_limit: int = 2) -> str:
        """Create a new chat session and return session ID"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = ChatManager(history_limit=history_limit)
        return session_id
    
    def get_session(self, session_id: str) -> ChatManager:
        """Get existing chat session"""
        if session_id not in self.sessions:
            # Auto-create if doesn't exist
            self.sessions[session_id] = ChatManager(history_limit=2)
        return self.sessions[session_id]
    
    def delete_session(self, session_id: str):
        """Delete a chat session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def reset_session(self, session_id: str):
        """Reset conversation history for a session"""
        if session_id in self.sessions:
            self.sessions[session_id].reset()

# Global session manager instance
session_manager = SessionManager()
