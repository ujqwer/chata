import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import styles from './ChatRoom.module.css'; // Assuming you have your CSS styles in this file

const ChatRoom = () => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [roomId, setRoomId] = useState('');

    useEffect(() => {
        if (!roomId) return;

        
        const socket = new SockJS('https://bitsbids.azurewebsites.net/ws');
        const client = Stomp.over(socket);

        client.connect({}, frame => {
            console.log('Connected: ' + frame);
            client.subscribe(`/topic/chat/${roomId}`, message => {
                const receivedMessage = JSON.parse(message.body).content;
                displayMessage(receivedMessage);
            });
        });

        setStompClient(client);

        return () => client && client.disconnect();
    }, [roomId]);

    const sendMessage = () => {
        if (messageInput && stompClient && roomId) {
            const chatMessage = {
                content: messageInput,
                sender: "User",
                roomId: roomId,
                type: 'CHAT'
            };
            stompClient.send(`/app/chat/${roomId}/send`, {}, JSON.stringify(chatMessage));
            displayMessage(messageInput); // Display the message you just sent
            setMessageInput('');
        }
    };

    const displayMessage = (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
    };

    return (
        <div>
            <div className={styles.chatContainer}>
                {messages.map((msg, index) => <div key={index}>{msg}</div>)}
            </div>
            <input 
                type="text" 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..." 
            />
            <button onClick={sendMessage}>Send</button>
            <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID" 
            />
            <button onClick={() => {}}>Join Room</button>
        </div>
    );
};

export default ChatRoom;
