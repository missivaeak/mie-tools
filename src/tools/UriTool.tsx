import { useState } from "react";
import InputTextarea from "../components/InputTextarea";

type UriToolMode = 'encode' | 'decode'
type UriEncoding = 'component' | 'regular'
type UriState = {
  readable: string;
  uriEncoded: string;
  mode: UriToolMode;
  encoding: UriEncoding;
}

const defaultState = `{
  "readable": "",
  "uriEncoded": "",
  "mode": "encode",
  "encoding": "component"
}`

export default function UriTool() {
  const storedState: UriState = JSON.parse(localStorage.getItem('uriState') ?? defaultState);
  const [readable, setReadable] = useState(storedState.readable);
  const [uriEncoded, setUriEncoded] = useState(storedState.uriEncoded);
  const [encoding, setEncoding] = useState(storedState.encoding);
  const [mode, setMode] = useState(storedState.mode);

  const updateState = function (update: Partial<UriState>) {
    const keyCallbackMap = {
      readable: setReadable,
      uriEncoded: setUriEncoded,
      mode: setMode,
      encoding: setEncoding
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('uriState', JSON.stringify(storedState));
  }

  const updateReadable = function (readable: string) {
    if (encoding === 'component') {
      const uriEncoded = encodeURIComponent(readable);
      updateState({ uriEncoded, readable });
    }

    if (encoding === 'regular') {
      const uriEncoded = encodeURI(readable);
      updateState({ uriEncoded, readable });
    }
  }

  const updateUriEncoded = function (uriEncoded: string) {
    if (mode === 'decode') {
      if (encoding === 'component') {
        const readable = decodeURIComponent(uriEncoded);
        updateState({ readable, uriEncoded });
      }

      if (encoding === 'regular') {
        const readable = decodeURI(uriEncoded);
        updateState({ readable, uriEncoded });
      }
    }

    if (mode === 'encode') {
      if (encoding === 'component') {
        const uriEncoded = encodeURIComponent(readable);
        updateState({ readable, uriEncoded });
      }

      if (encoding === 'regular') {
        const readable = decodeURI(uriEncoded);
        updateState({ readable, uriEncoded });
      }
    }
  }

  const updateEncoding = function (encoding: UriEncoding) {
    if (mode === 'decode') {
      if (encoding === 'component') {
        const readable = decodeURIComponent(uriEncoded);
        updateState({ readable, encoding });
      }

      if (encoding === 'regular') {
        const readable = decodeURI(uriEncoded);
        updateState({ readable, encoding });
      }
    }

    if (mode === 'encode') {
      if (encoding === 'component') {
        const uriEncoded = encodeURIComponent(readable);
        updateState({ uriEncoded, encoding });
      }

      if (encoding === 'regular') {
        const uriEncoded = encodeURI(readable);
        updateState({ uriEncoded, encoding });
      }
    }
  }

  const updateMode = function (mode: UriToolMode) {
    updateState({ mode })
  }

  return <>
    <section>
      <button className={encoding === 'component' ? 'active' : ''} onClick={() => updateEncoding('component')} >Component</button>
      <button className={encoding === 'regular' ? 'active' : ''} onClick={() => updateEncoding('regular')} >Regular</button>
      |
      <button className={mode === 'encode' ? 'active' : ''} onClick={() => updateMode('encode')} >Encode</button>
      <button className={mode === 'decode' ? 'active' : ''} onClick={() => updateMode('decode')} >Decode</button>
    </section >
    <h3>Text</h3>
    <InputTextarea
      value={readable}
      onChange={updateReadable}
      disabled={mode !== 'encode'}
    />
    <h3>URI encoded</h3>
    <InputTextarea
      value={uriEncoded}
      onChange={updateUriEncoded}
      disabled={mode !== 'decode'}
    />
  </>
}
