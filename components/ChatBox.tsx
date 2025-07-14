
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Player, PlayerStatus } from '../types.ts';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    currentUserId: string | null;
    players: Player[];
    disabled: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, currentUserId, players, disabled }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const currentUser = players.find(p => p.id === currentUserId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl h-64 flex flex-col">
            <div className="p-2 border-b border-gray-700 text-center">
                <h3 className="font-bold text-red-400">Chat del Pueblo</h3>
                <p className="text-xs text-gray-400">Sé respetuoso y amable.</p>
            </div>
            <div className="flex-grow p-3 overflow-y-auto space-y-2">
                {messages.sort((a,b) => a.timestamp - b.timestamp).map(msg => (
                    <div key={msg.id} className={`text-sm ${msg.isSystem ? 'text-yellow-400 italic' : ''}`}>
                        {!msg.isSystem && <strong className="font-bold text-cyan-400">{msg.senderName}: </strong>}
                        <span>{msg.text}</span>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "Solo los vivos pueden hablar..." : "Escribe tu mensaje..."}
                    className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:border-red-500 transition-colors"
                    disabled={disabled}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg disabled:bg-gray-500 transition-colors"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
};

export default ChatBox;