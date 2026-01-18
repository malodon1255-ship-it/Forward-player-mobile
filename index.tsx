import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = typeof document !== 'undefined' ? document.getElementById('root') : null;

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // If we are in a native environment where "document" is undefined, 
  // the environment typically handles the entry point via a different mechanism 
  // (like AppRegistry.registerComponent). 
  // For the purpose of this project, we export App as the default.
  console.log("No DOM root found. Assuming native environment.");
}

export default App;
