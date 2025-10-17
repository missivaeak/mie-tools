import { useState } from "react";
import InputTextarea from "../components/InputTextarea";
// import InputSelect from "../components/InputSelect";

const encodings = ['utf-8'] as const;
type Encoding = (typeof encodings)[number];
type Base64Mode = 'encode' | 'decode';

type Base64State = {
  readable: string;
  base64: string;
  encoding: Encoding;
  mode: Base64Mode;
}

const defaultState = `{
  "readable": "",
  "base64": "",
  "encoding": "utf-8",
  "mode": "encode"
}`

export default function Base64Tool() {
  const storedState: Base64State = JSON.parse(localStorage.getItem('base64State') ?? defaultState);
  const [readable, setReadable] = useState(storedState.readable);
  const [base64, setBase64] = useState(storedState.base64);
  const [encoding, setEncoding] = useState(storedState.encoding);
  const [mode, setMode] = useState(storedState.mode);

  const updateState = function (update: Partial<Base64State>) {
    const keyCallbackMap = {
      readable: setReadable,
      base64: setBase64,
      encoding: setEncoding,
      mode: setMode
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('base64State', JSON.stringify(storedState));
  }

  const readableToBase64 = function (readable: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(readable);
    const text = bytes.reduce((acc, byte) => {
      acc += String.fromCharCode(byte);
      return acc;
    }, '');
    const base64 = btoa(text);

    return base64;
  }

  const base64ToReadable = function (base64: string) {
    const text = atob(base64);
    const length = text.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = text.charCodeAt(i);
    }
    const decoder = new TextDecoder(encoding);
    const readable = decoder.decode(bytes);

    return readable;
  }

  const updateReadable = function (readable: string) {
    const base64 = readableToBase64(readable);
    updateState({ readable, base64 });
  }

  const updateBase64 = function (base64: string) {
    const readable = base64ToReadable(base64);
    updateState({ base64, readable });
  }

  // const updateEncoding = function (encoding: Encoding) {
  //   if (mode === 'encode') {
  //     const base64 = readableToBase64(readable);
  //     updateState({ encoding, base64 });
  //   }
  //
  //   if (mode === 'decode') {
  //     const readable = base64ToReadable(base64);
  //     updateState({ encoding, readable });
  //   }
  // }

  const updateMode = function (mode: Base64Mode) {
    updateState({ mode });
  }

  return <>
    <section>
      <button className={mode === 'encode' ? 'active' : ''} onClick={() => updateMode('encode')} >Encode</button>
      <button className={mode === 'decode' ? 'active' : ''} onClick={() => updateMode('decode')} >Decode</button>
    </section >
    <h3>Text</h3>
    <InputTextarea
      value={readable}
      onChange={updateReadable}
      disabled={mode !== 'encode'}
    />
    <h3>Base64</h3>
    <InputTextarea
      value={base64}
      onChange={updateBase64}
      disabled={mode !== 'decode'}
    />
    {/* <section> */}
    {/*   <span>Encoding</span> */}
    {/*   <InputSelect options={encodings} value={encoding} onChange={updateEncoding} /> */}
    {/* </section> */}
  </>
}
