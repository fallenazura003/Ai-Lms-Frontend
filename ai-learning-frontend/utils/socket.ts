import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

let stompClient: Client | null = null;

export const connectSocket = (email: string, onMessage: (message: any) => void) => {
    stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // Sửa endpoint nếu cần
        onConnect: () => {
            stompClient?.subscribe(`/user/${email}/queue/notifications`, (message: IMessage) => {
                const payload = JSON.parse(message.body);
                onMessage(payload);
            });
        },
        debug: (str) => console.log(str), // optional: remove in production
        reconnectDelay: 5000, // reconnect every 5s if disconnected
    });

    stompClient.activate();
};

export const disconnectSocket = () => {
    stompClient?.deactivate();
    stompClient = null;
};
