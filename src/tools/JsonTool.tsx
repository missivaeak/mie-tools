import { useState } from "react";
import InputTextarea from "../components/InputTextarea";
import { prettyPrint } from "@base2/pretty-print-object";

type JsonMode = 'parse' | 'stringify';

type JsonToolState = {
  json: string;
  jsObject: string;
  mode: JsonMode;
  valid: boolean;
}

const defaultState = `{
  "json": "",
  "jsObject": "",
  "mode": "parse",
  "valid": true
}`

export default function JsonTool() {
  const storedState: JsonToolState = JSON.parse(localStorage.getItem('jsonState') ?? defaultState);
  const [json, setJson] = useState(storedState.json);
  const [jsObject, setJsObject] = useState(storedState.jsObject);
  const [mode, setMode] = useState(storedState.mode);
  const [valid, setValid] = useState(storedState.valid);

  const updateState = function(update: Partial<JsonToolState>) {
    const keyCallbackMap = {
      json: setJson,
      jsObject: setJsObject,
      mode: setMode,
      valid: setValid
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('jsonState', JSON.stringify(storedState));
  }

  const jsObjectToJson = function(jsObject: string) {
    return JSON.stringify(eval(`(${jsObject})`));
  }

  const jsonToJsObject = function(json: string) {
    return prettyPrint(JSON.parse(json));
  }

  const updateJson = function(json: string) {
    try {
      const jsObject = jsonToJsObject(json);
      updateState({ json, jsObject, valid: true });
    } catch (e) {
      console.warn(e);
      updateState({ json, jsObject: '', valid: false })
    }
  }

  const updateJsObject = function(jsObject: string) {
    try {
      const json = jsObjectToJson(jsObject);
      updateState({ json, jsObject, valid: true });
    } catch (e) {
      console.warn(e);
      updateState({ json: '', jsObject, valid: false })
    }
  }

  const updateMode = function(mode: JsonMode) {
    updateState({ mode });
  }

  return <>
    <section>
      <h2>JSON/Javascript object conversion</h2>
    </section>
    <section>
      <button className={`smaller ${mode === 'parse' ? 'active' : ''}`} onClick={() => updateMode('parse')} >Parse</button>
      <button className={`smaller ${mode === 'stringify' ? 'active' : ''}`} onClick={() => updateMode('stringify')} >Stringify</button>
    </section >
    <h3>JSON</h3>
    <InputTextarea
      value={json}
      onChange={updateJson}
      disabled={mode !== 'parse'}
      className={mode === 'parse' ? valid ? 'valid' : !valid ? 'invalid' : '' : ''}
    />
    <h3>Javascript Object</h3>
    <InputTextarea
      value={jsObject}
      onChange={updateJsObject}
      disabled={mode !== 'stringify'}
      className={mode === 'stringify' ? valid ? 'valid' : !valid ? 'invalid' : '' : ''}
    />
  </>
}
