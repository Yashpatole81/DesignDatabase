"""
Simple demo with mock LLM (no API key needed)
"""

from chat_manager import ChatManager

def mock_llm_response(messages):
    """Mock LLM that echoes context info"""
    last_user_msg = messages[-1]['content']
    context_count = len([m for m in messages if m['role'] == 'user'])
    
    responses = {
        "What is Python?": "Python is a high-level programming language known for simplicity.",
        "How do I install it?": "You can install Python from python.org or use package managers like apt or brew.",
        "Show me a hello world example": "Here's a simple example:\n\nprint('Hello, World!')",
        "What about variables?": "In Python, you create variables like: x = 10 or name = 'John'"
    }
    
    response = responses.get(last_user_msg, f"I received: {last_user_msg}")
    return f"{response}\n[Context: {context_count} user messages in current context]"

# Create chat manager with different history limits
print("=" * 60)
print("DEMO: History Limit = 2 (keeps last 2 exchanges)")
print("=" * 60)

chat = ChatManager(history_limit=2)

print("\n--- Query 1 ---")
print("User: What is Python?")
response = chat.send_query("What is Python?", mock_llm_response)
print(f"Assistant: {response}")
print(f"Messages in context: {len(chat.get_current_context())}")

print("\n--- Query 2 ---")
print("User: How do I install it?")
response = chat.send_query("How do I install it?", mock_llm_response)
print(f"Assistant: {response}")
print(f"Messages in context: {len(chat.get_current_context())}")

print("\n--- Query 3 ---")
print("User: Show me a hello world example")
response = chat.send_query("Show me a hello world example", mock_llm_response)
print(f"Assistant: {response}")
print(f"Messages in context: {len(chat.get_current_context())}")

print("\n--- Query 4 ---")
print("User: What about variables?")
response = chat.send_query("What about variables?", mock_llm_response)
print(f"Assistant: {response}")
print(f"Messages in context: {len(chat.get_current_context())}")

print("\n" + "=" * 60)
print("Current Context (what LLM sees):")
print("=" * 60)
for i, msg in enumerate(chat.get_current_context()):
    role = msg['role'].upper()
    content = msg['content'][:60] + "..." if len(msg['content']) > 60 else msg['content']
    print(f"{i+1}. {role}: {content}")

print("\n" + "=" * 60)
print("Full History (all messages):")
print("=" * 60)
for i, msg in enumerate(chat.get_full_history()):
    role = msg['role'].upper()
    content = msg['content'][:60] + "..." if len(msg['content']) > 60 else msg['content']
    print(f"{i+1}. {role}: {content}")

print("\n" + "=" * 60)
print("DEMO: History Limit = 1 (keeps only last 1 exchange)")
print("=" * 60)

chat2 = ChatManager(history_limit=1)

print("\n--- Query 1 ---")
response = chat2.send_query("What is Python?", mock_llm_response)
print(f"Messages in context: {len(chat2.get_current_context())}")

print("\n--- Query 2 ---")
response = chat2.send_query("How do I install it?", mock_llm_response)
print(f"Messages in context: {len(chat2.get_current_context())}")

print("\n--- Query 3 ---")
response = chat2.send_query("Show me a hello world example", mock_llm_response)
print(f"Messages in context: {len(chat2.get_current_context())}")

print("\nCurrent Context with history_limit=1:")
for msg in chat2.get_current_context():
    print(f"  {msg['role']}: {msg['content'][:50]}...")
