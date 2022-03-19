import { useEffect, useState } from 'react';
import { useChannel } from "@ably-labs/react-hooks";
import logo from './logo.svg';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);

    const [channel] = useChannel("some-channel-name", async (message) => {
        console.log("Recieved Ably message", message);
        setMessages(messages => [...messages, message.data]);
    });

    useEffect(() => {
        channel.publish("hello-world-message", { text: "Hi, I just joined the channel" });
    }, [channel]);

    const messageList = messages.map((message, index) => {
        return (<li key={index}>{message.text}</li>);
    });

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>Hello Vite + React!</p>
                <p>
                    Edit <code>App.tsx</code> and save to test HMR updates.
                </p>
                <h2>Ably Message Data</h2>
                <ul>
                    {messageList}
                </ul>
            </header>
        </div>
    )
}

export default App
