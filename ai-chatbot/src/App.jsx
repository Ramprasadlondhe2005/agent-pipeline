import { useState, useRef, useEffect } from 'react';
import './App.css';

function ChatBubble({ message }) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`message ${isUser ? 'user' : 'bot'}`}>
      <div className="bubble">
        {/* Simple rendering for now */}
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
      </div>
      
      {!isUser && message.agents && (
        <div className="pipeline-trace">
          <div className="pipeline-title">Pipeline Trace</div>
          {message.agents.map((agent, idx) => (
            <div key={idx} className="agent-step">
              <span className="agent-name">{agent.name}:</span>
              <span className="agent-output">
                {agent.output.length > 150 ? agent.output.substring(0, 150) + '...' : agent.output}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userMessage.text }),
      });

      const data = await response.json();
      
      if (data.error) {
         setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: "Error: " + data.response, sender: 'bot' },
        ]);
      } else {
         setMessages((prev) => [
          ...prev,
          { 
            id: Date.now() + 1, 
            text: data.response, 
            sender: 'bot',
            agents: data.agents 
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Failed to connect to the backend. Make sure the FastAPI server is running on port 8000.", sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Agentic Pipeline</h1>
        <p>Powered by 5 AI Agents working in sequence</p>
      </div>

      <div className="chat-area">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Welcome to the 5-Agent Chat</p>
            <p style={{ fontSize: '0.9rem' }}>Try: "Write a python script to scrape a website"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="thinking">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the pipeline anything..."
          disabled={isLoading}
        />
        <button type="submit" disabled={!input.trim() || isLoading}>
          Run Pipeline
        </button>
      </form>
    </div>
  );
}

export default App;
