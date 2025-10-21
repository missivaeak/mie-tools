import { useState, type JSX } from 'react'
import './app.css'
import Toolbar from './Toolbar'
import JwtTool from './tools/JwtTool';
import Base64Tool from './tools/Base64Tool';
import UriTool from './tools/UriTool';
import WhitespaceTool from './tools/WhitespaceTool';
import JsonTool from './tools/JsonTool';

export type Tool = {
  name: string,
  component: JSX.Element;
}

export const toolKeys = ['jwt', 'base64', 'uri', 'whitespace', 'json'] as const;
export type ToolKey = (typeof toolKeys)[number];

export type Tools = {
  [K in ToolKey]: Tool;
};

const tools: Tools = {
  jwt: { name: 'JWT', component: <JwtTool /> },
  base64: { name: 'Base64', component: <Base64Tool /> },
  uri: { name: 'URI encoding', component: <UriTool /> },
  whitespace: { name: 'Whitespace removal', component: <WhitespaceTool /> },
  json: { name: 'JSON', component: <JsonTool /> }
}

function App() {
  const storedToolKey = localStorage.getItem('toolKey') as ToolKey | null;
  const [toolKey, setToolKey] = useState<ToolKey | null>(storedToolKey);
  const tool = toolKey ? tools[toolKey] : null;

  function onSelection(toolKey: ToolKey) {
    setToolKey(toolKey);
    localStorage.setItem('toolKey', toolKey);
  }

  return (
    <main>
      <header>
        <h1>Tools</h1>
      </header>
      <nav>
        <Toolbar tools={tools} selected={toolKey} onSelection={onSelection} />
      </nav>
      <article>
        {tool?.component}
      </article>
      <footer>
        <p>&#129462;&#129462;</p>
      </footer>
    </main>
  )
}

export default App
