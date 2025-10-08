import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import Button from './Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => void;
  currentUser: 'customer' | 'workshop';
  disabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, currentUser, disabled = false }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg">
      <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender === currentUser;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${
                  isCurrentUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-600 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 opacity-70 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
            <p className="text-center text-gray-500 text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={disabled ? "O chat foi desativado." : "Digite sua mensagem..."}
            className="flex-grow w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 disabled:bg-gray-800"
            disabled={disabled}
          />
          <Button type="submit" disabled={disabled || !newMessage.trim()}>
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
