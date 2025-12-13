import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [scrapperInfo, setScrapperInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Get scrapper info from location state or sessionStorage
    const storedRequest = sessionStorage.getItem('scrapRequest');
    if (storedRequest) {
      const data = JSON.parse(storedRequest);
      // Mock scrapper info
      setScrapperInfo({
        name: 'Rajesh Kumar',
        rating: 4.8,
        phone: '+91 98765 43210',
        avatar: null
      });
    } else if (location.state?.scrapperInfo) {
      setScrapperInfo(location.state.scrapperInfo);
    }

    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        text: 'Hello! I\'m on my way to pick up your scrap. I\'ll reach in about 30 minutes.',
        sender: 'scrapper',
        timestamp: new Date(Date.now() - 60000 * 5) // 5 minutes ago
      }
    ]);
  }, [location]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate scrapper reply after 2 seconds
    setTimeout(() => {
      const replies = [
        'Sure, I\'ll be there soon!',
        'Got it, thanks!',
        'No problem, I\'m on my way.',
        'I\'ll reach in 10 minutes.',
        'Okay, see you soon!'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        text: randomReply,
        sender: 'scrapper',
        timestamp: new Date()
      }]);
    }, 2000);

    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diff = now - messageDate;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return messageDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6 border-b" style={{ borderColor: 'rgba(100, 148, 110, 0.2)', backgroundColor: '#ffffff' }}>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {scrapperInfo && (
          <div className="flex items-center gap-3 flex-1 px-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold"
              style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
            >
              {scrapperInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-semibold" style={{ color: '#2d3748' }}>
                {scrapperInfo.name}
              </h3>
              <div className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"/>
                </svg>
                <span className="text-xs md:text-sm font-medium" style={{ color: '#718096' }}>
                  {scrapperInfo.rating}
                </span>
                <span className="text-xs md:text-sm" style={{ color: '#718096' }}>
                  • Online
                </span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => {
            if (scrapperInfo?.phone) {
              window.location.href = `tel:${scrapperInfo.phone}`;
            }
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[80%] md:max-w-[70%]">
              {message.sender === 'scrapper' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
                >
                  {scrapperInfo?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                </div>
              )}
              <div className="flex flex-col">
                <div
                  className={`rounded-2xl px-4 py-2 md:px-5 md:py-3 shadow-sm ${
                    message.sender === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                  }`}
                  style={{
                    backgroundColor: message.sender === 'user' ? '#64946e' : '#ffffff',
                    color: message.sender === 'user' ? '#ffffff' : '#2d3748'
                  }}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
                <span className="text-xs mt-1 px-2" style={{ color: '#718096' }}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
                >
                  U
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-6 border-t" style={{ borderColor: 'rgba(100, 148, 110, 0.2)', backgroundColor: '#ffffff' }}>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full py-3 px-4 pr-12 rounded-xl border-2 focus:outline-none focus:ring-2 resize-none text-sm md:text-base"
              style={{
                borderColor: inputMessage ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                color: '#2d3748',
                backgroundColor: '#f9f9f9',
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 flex-shrink-0"
            style={{
              backgroundColor: inputMessage.trim() ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
              color: '#ffffff'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;

