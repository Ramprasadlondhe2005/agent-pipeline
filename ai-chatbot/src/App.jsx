import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Server, Zap, Layers, RefreshCw } from 'lucide-react';
import './App.css';

function AgentIcon({ name }) {
  switch (name) {
    case 'Router': return <Server size={14} />;
    case 'Researcher': return <Layers size={14} />;
    case 'Drafter': return <Zap size={14} />;
    case 'Reviewer': return <RefreshCw size={14} />;
    case 'Polisher': return <Sparkles size={14} />;
    default: return <Bot size={14} />;
  }
}

function ChatBubble({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message ${isUser ? 'user' : 'bot'}`}>
      <div className="bubble">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500', opacity: 0.8, fontSize: '0.9rem' }}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
          {isUser ? 'You' : 'Agentic Pipeline'}
        </div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
      </div>

      {!isUser && message.agents && (
        <div className="pipeline-trace">
          <div className="pipeline-title">
            <Server size={14} /> Pipeline Trace
          </div>
          {message.agents.map((agent, idx) => (
            <div key={idx} className="agent-step">
              <span className="agent-name">
                <AgentIcon name={agent.name} /> {agent.name}:
              </span>
              <span className="agent-output">
                {agent.output.length > 200 ? agent.output.substring(0, 200) + '...' : agent.output}
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
        <p>Powered by 5 AI Agents Working in sequence</p>
      </div>

      <div className="chat-area">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <Bot size={40} color="var(--primary)" />
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: '500', color: '#fff', marginBottom: '24px' }}>Ready</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setInput("Write a python script to scrape a website")} style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                Scrape website
              </button>
              <button onClick={() => setInput("Explain quantum computing")} style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                Quantum computing
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="thinking">
            <Bot size={20} color="var(--text-muted)" style={{ marginRight: '8px' }} />
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
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={!input.trim() || isLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default App;
