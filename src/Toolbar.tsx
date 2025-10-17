import { type ToolKey, type Tools } from "./App";

type ToolbarProps = {
  selected?: ToolKey | null;
  onSelection: (toolKey: ToolKey) => void;
  tools: Tools;
}

export default function Toolbar({ onSelection, tools, selected }: ToolbarProps) {
  return <>
    {Object.entries(tools).map(([key, tool]) =>
      // @ts-expect-error
      <button className={selected === key ? 'active' : null} key={key} onClick={() => onSelection(key)}>{tool.name}</button>
    )}
  </>;
}
