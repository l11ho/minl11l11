import React, { useEffect, useRef, useState } from 'react';
import './ChatBox.css';

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Здравствуйте, уважаемые клиенты! BestPrice готов помочь вам с подбором туров, отелей и авиабилетов.',
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (started) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [started]);

  const handleStartChat = () => {
    setStarted(true);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Произошла ошибка');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Извините, сейчас я не могу ответить.',
        },
      ]);
    } catch (error) {
      console.error('Ошибка чата на стороне клиента:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Ошибка подключения к AI: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="travel-chat-widget">
          <div className="travel-chat-header">
            <div className="travel-chat-header-left">
              <div className="travel-chat-logo">✈</div>
              <div>
                <h3>BestPrice</h3>
                <p>Быстрая поддержка при бронировании туров</p>
              </div>
            </div>

            <button
              className="travel-chat-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {!started ? (
            <>
              <div className="travel-chat-body">
                <div className="travel-chat-brand">
                  <div className="travel-chat-mini-logo">✈</div>
                  <span>VietJourney</span>
                </div>

                <div className="travel-chat-message">
                  Здравствуйте, уважаемые клиенты! BestPrice готова помочь вам с вопросами,
                  касающимися туров, отелей и авиабилетов.
                </div>
              </div>

              <div className="travel-chat-footer">
                <button
                  className="travel-chat-action"
                  onClick={handleStartChat}
                >
                  Начать чат
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="chat-messages-area">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-bubble ${
                      msg.role === 'user'
                        ? 'user-bubble'
                        : 'assistant-bubble'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}

                {loading && (
                  <div className="chat-bubble assistant-bubble">
                    Я ищу ответ...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Введите свой вопрос..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={sendMessage} disabled={loading}>
                  {loading ? '...' : 'Отправить'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatBox;