import { useState } from "react";
import InputTextarea from "../components/InputTextarea";
import InputToggle from "../components/InputToggle";

type UriState = {
  input: string;
  spaces: boolean;
  tabs: boolean;
  newline: boolean;
}

const defaultState = `{
  "input": "",
  "spaces": true,
  "tabs": true,
  "newline": true
}`

export default function WhitespaceTool() {
  const storedState: UriState = JSON.parse(localStorage.getItem('whitespaceState') ?? defaultState);
  const [input, setInput] = useState(storedState.input);
  const [spaces, setSpaces] = useState(storedState.spaces);
  const [tabs, setTabs] = useState(storedState.tabs);
  const [newline, setNewline] = useState(storedState.newline);
  let output = input;

  if (spaces) output = output.replace(/[ ]/g, '');
  if (tabs) output = output.replace(/\t/g, '');
  if (newline) output = output.replace(/[\r\n\f\v]/g, '');

  const updateState = function (update: Partial<UriState>) {
    const keyCallbackMap = {
      input: setInput,
      spaces: setSpaces,
      tabs: setTabs,
      newline: setNewline
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('whitespaceState', JSON.stringify(storedState));
  }

  const updateInput = function (input: string) {
    updateState({ input });
  }

  const toggleSpaces = function () {
    updateState({ spaces: !spaces })
  }

  const toggleTabs = function () {
    updateState({ tabs: !tabs })
  }

  const toggleNewline = function () {
    updateState({ newline: !newline })
  }

  return <>
    <section>
      <InputToggle value={spaces} onToggle={toggleSpaces} label="Spaces" />
      <InputToggle value={tabs} onToggle={toggleTabs} label="Tabs" />
      <InputToggle value={newline} onToggle={toggleNewline} label="Newlines" />
    </section >
    <h3>Text</h3>
    <InputTextarea
      value={input}
      onChange={updateInput}
    />
    <h3>Output</h3>
    <InputTextarea
      value={output}
      disabled={true}
    />
  </>
}
