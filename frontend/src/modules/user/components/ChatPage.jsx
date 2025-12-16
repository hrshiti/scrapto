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
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Prevent body scrolling when chat page is open
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalHeight = document.body.style.height;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.height = '100%';
    document.body.style.width = '100%';
    
    // Prevent scrolling on html element too
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    
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
    
    // Cleanup: restore original styles when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.height = originalHeight;
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [location]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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
      className="fixed inset-0 w-full h-full flex flex-col"
      style={{ 
        backgroundColor: '#f4ebe2',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        touchAction: 'none'
      }}
      onTouchMove={(e) => {
        // Prevent page scroll on touch move outside messages area
        if (e.target === e.currentTarget || !messagesContainerRef.current?.contains(e.target)) {
          e.preventDefault();
        }
      }}
    >
      {/* Fixed Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b z-10 flex-shrink-0"
        style={{ 
          borderColor: 'rgba(100, 148, 110, 0.2)', 
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:opacity-70"
          style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#2d3748' }}>
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {scrapperInfo && (
          <div className="flex items-center gap-3 flex-1 px-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold relative"
              style={{ backgroundColor: 'rgba(100, 148, 110, 0.15)', color: '#64946e' }}
            >
              {scrapperInfo.name.split(' ').map(n => n[0]).join('')}
              {/* Online indicator */}
              <div 
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                style={{ 
                  backgroundColor: '#10b981',
                  borderColor: '#ffffff'
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold truncate" style={{ color: '#2d3748' }}>
                {scrapperInfo.name}
              </h3>
              <div className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: '#718096' }}>
                  {scrapperInfo.rating}
                </span>
                <span className="text-xs" style={{ color: '#10b981' }}>
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
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:opacity-70"
          style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Scrollable Messages Area - Only this area scrolls */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ 
          backgroundColor: '#f4ebe2',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          overscrollBehaviorY: 'contain'
        }}
        onTouchStart={(e) => {
          // Allow scrolling only in messages area
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          // Allow scrolling only in messages area
          e.stopPropagation();
        }}
      >
        <div className="space-y-3 pb-2">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ 
                    backgroundColor: message.sender === 'user' 
                      ? 'rgba(100, 148, 110, 0.2)' 
                      : 'rgba(100, 148, 110, 0.15)', 
                    color: '#64946e' 
                  }}
                >
                  {message.sender === 'user' 
                    ? 'U' 
                    : (scrapperInfo?.name?.split(' ').map(n => n[0]).join('') || 'S')}
                </div>
                
                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      message.sender === 'user' 
                        ? 'rounded-tr-md' 
                        : 'rounded-tl-md'
                    }`}
                    style={{
                      backgroundColor: message.sender === 'user' 
                        ? '#64946e' 
                        : '#ffffff',
                      color: message.sender === 'user' 
                        ? '#ffffff' 
                        : '#2d3748',
                      boxShadow: message.sender === 'user'
                        ? '0 2px 8px rgba(100, 148, 110, 0.2)'
                        : '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                  <span 
                    className={`text-[10px] mt-1 px-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                    style={{ color: '#9ca3af' }}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div 
        className="px-4 py-3 border-t flex-shrink-0 z-10"
        style={{ 
          borderColor: 'rgba(100, 148, 110, 0.2)', 
          backgroundColor: '#ffffff',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full py-2.5 px-4 rounded-2xl border-2 focus:outline-none resize-none text-sm"
              style={{
                borderColor: inputMessage ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
                color: '#2d3748',
                backgroundColor: '#f9fafb',
                minHeight: '44px',
                maxHeight: '100px',
                transition: 'all 0.2s ease'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: inputMessage.trim() ? '#64946e' : 'rgba(100, 148, 110, 0.3)',
              color: '#ffffff',
              boxShadow: inputMessage.trim() 
                ? '0 4px 12px rgba(100, 148, 110, 0.3)' 
                : 'none'
            }}
          >
            {inputMessage.trim() ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;
