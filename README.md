# Ably + React + Azure Static Web Apps.

A GitHub template to quickly get started with Ably, hosted on Azure Static Web Apps (+built in Azure Functions), TypeScript and Jest.

**This template application is a React app** - it's based on the [template application here](https://github.com/snakemode/vite-typescript-azure-functions) with additional support for React and React hot reload.

It works like a default `create-react-app` react app, but without `webpack`, and without the need for a load of babel configuration that you don't want to have to see ever again :)

Contents:

- What is this?
- Usage
- Getting and Managing Ably API keys
- How the app works
- Deployment
- Dev Containers
- Credits

# What is this?

This is a GitHub template repository that will create you a pre-configured, v-latest experience on Azure Static Web Apps, along with a hot-reload enabled, local development experience. We've configured Jest, TypeScript, ts-jest, and a bunch of default built jobs so you can create a new respository and just get to work.

There's a built in hot-reloading dev experience powered by Vite.js.

It's built out-of-the-box to support Ably realtime, and has pre-build APIs for the Ably JavaScript SDK to handle authentication and messaging.

Bundled tools:

- Vite (vite.dev) - hot reload, bundleless dev server
- TypeScript - language, type checking
- Jest (and ts-jest) - test runner
- Azure Functions - bundled API / BFF support.
- Ably - realtime, auth, messaging

# Usage

- Create a respository based on this repository.
- Clone your new repository.
- Run `npm install` to install the dependencies.
- Run `npm run start` to start the local development server.
- Browser to `http://localhost:8080`

You'll see a white page load, which in turn will load the Ably JavaScript SDK, and use the included Azure functions to handle API key management.When everything is running, you'll see Ably messages written to the page.

You can run tests on the CLI:

```bash
npm run test
```

Or with a VS Code plugin like `Wallaby.js`.

# Getting and Managing Ably API keys

In order to run this app, you will need an Ably API key. If you are not already signed up, you can [sign up now for a free Ably account](https://www.ably.io/signup). Once you have an Ably account:

1. Log into your app dashboard.
2. Under **“Your apps”**, click on **“Manage app”** for any app you wish to use for this tutorial, or create a new one with the “Create New App” button.
3. Click on the **“API Keys”** tab.
4. Copy the secret **“API Key”** value from your Root key, we will use this to configure our app.

This app is going to use [Ably Channels](https://www.ably.io/channels) and [Token Authentication](https://www.ably.io/documentation/rest/authentication/#token-authentication).

## Configuring your Ably API keys

**For local development**

You need to create a `.env` file in `./api` to with a variable defined called `ABLY_API_KEY` to store your secret.
You can do this from the command line if you like:

```bash
cd api
echo ABLY_API_KEY=YOUR-API-KEY-HERE > .env
```

\*You need to restart the dev server after you create this `.env` file.

**Once deployed to Azure**

Azure Static Websites uses the Azure Portals `AppSettings` application configuration to store the API key.
You need to navigate to your settings, and create a new setting with the key `ABLY_API_KEY` and a value of your key.

If you need to use another kind of secrets store, you'll have to implement that yourself by editing `./api/ably-token-request` and modifying the code the loads the key from `process.env.ABLY_API_KEY`.

# How the app works

There are two interesting things to highlight in this simple react app.

1. Where we configure Ably
2. How we use Ably channels

## Configuring Ably

Ably configuration is done in `main.tsx`, and it looks like this:

```tsx
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { configureAbly } from "@ably-labs/react-hooks";

function generateUuid() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const optionalClientId = generateUuid();
configureAbly({
  authUrl: `/api/ably/token-request?clientId=${optionalClientId}`,
  clientId: optionalClientId,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
```

You'll notice that we're importing `configureAbly` from the package `@ably-labs/react-hooks`

```tsx
import { configureAbly } from "@ably-labs/react-hooks";
```

Calling this function allows us to configure our global instance of the `Ably SDK` with authentication and a client identity. This is done by passing in a standard configuration object, and all the code related to the `optionalClientId` is... optional! If you don't pass in a clientId, we'll generate one for you, but it's a good idea to do so as you can verify that messages that arrive are from the app users you expect.

In this example, we just use a random `UUID` as the clientId.

## How we use Ably channels

We're using the `@ably-labs/react-hooks` package to provide a simple abstraction for Ably channels.

An example of this usage is seen in `App.tsx`, which will send an Ably message, and display it on the page, along with the messages for anyone else that open the app at the same time.

First we import react's `useEffect` and `useState` hooks, along with the channel we previously configured via `useChannel` (followed by the usual React demo app resources).

```tsx
import { useEffect, useState } from "react";
import { useChannel } from "@ably-labs/react-hooks";
import logo from "./logo.svg";
import "./App.css";
```

Now we're definding our React App function. We're going to use `useState` to store an array of messages we receive from our Ably channels. When a new message is added to this array, it'll cause our component to re-render.

```tsx
function App() {
    const [messages, setMessages] = useState([]);
```

Next, we're using the `useChannel` hook to create a channel instance. We pass in the channel name, and the channel will be created when the component mounts.

As our second parameter, you can pass in a function that will be called when messages are received on that channel. You can provide any parameters that the `Ably JavaScript SDK` supports here - for example, you can pass in a message name as the second parameter to only receive messages of a specific type when we `useChannel`.

In the hook, we're calling our `setMessages` function to update the state with the new message.

```tsx
const [channel] = useChannel("some-channel-name", async (message) => {
  console.log("Recieved Ably message", message);
  setMessages((messages) => [...messages, message.data]);
});
```

Next we're going to use a regular `useEffect` hook to publish our own `hello-world-message` when we connect to the Ably channel. This is just a standard `Ably SDK` call to `publish` a message.

```tsx
useEffect(() => {
  channel.publish("hello-world-message", {
    text: "Hi, I just joined the channel",
  });
}, [channel]);
```

Finally we have some standard React code to convert our list of Ably messages into a `<li>` element for rendering.

```tsx
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
```

This is all it takes to use Ably with react.

# Deployment

When you use the Azure portal to create a new Static Web Application, select custom, and use the following configuration values:

    app_location: "/"
    api_location: "api"
    output_location: "dist"

You can either enter these in the Azure Portal UI, or you can edit the GitHub build .yml file that gets created in `.github` afterwards if you missed this.

# Dev Containers

This repository contains pre-configured `.devcontainer` support, so you can use it to spin up either VS Code devcontainers, or a GitHub Codespace for your application. It should just work!

# Credits

This template is maintained by David Whitney (@davidwhitney / twitter/@david_whitney).
