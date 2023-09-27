import { createRoot } from 'react-dom/client';

if (DEBUG) {
  new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

const appMount = document.getElementById('app')!;
const root = createRoot(appMount);
root.render(<h1>Hello, world</h1>);