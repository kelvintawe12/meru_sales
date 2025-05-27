import './index.css';
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from './components/ErrorBoundary';

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <BrowserRouter>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </BrowserRouter>
);