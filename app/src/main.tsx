import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { configureAbly } from "@ably-labs/react-hooks";

function generateUuid() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const optionalClientId = generateUuid();
configureAbly({ authUrl: `/api/ably/token-request?clientId=${optionalClientId}`, clientId: optionalClientId });

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)
