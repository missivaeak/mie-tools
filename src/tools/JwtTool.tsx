import { useState } from "react";
import InputTextarea from "../components/InputTextarea";
import InputText from "../components/InputText";
import jwt from 'jwt-simple';
import InputSelect from "../components/InputSelect";

const algorithms = ['HS256', 'HS384', 'HS512', 'RS256'] as const;
type Algorithm = (typeof algorithms)[number];
type JwtToolMode = 'generate' | 'inspect';
type JwtState = {
  payload: string;
  token: string;
  secret: string;
  valid: boolean;
  algorithm: Algorithm;
  mode: JwtToolMode;
}

const defaultState = `{
  "payload": "",
  "token": "",
  "secret": "",
  "valid": false,
  "algorithm": "HS256",
  "mode": "inspect"
}`

export default function JwtTool() {
  const storedState: JwtState = JSON.parse(localStorage.getItem('jwtState') ?? defaultState);
  const [payload, setPayload] = useState(storedState.payload);
  const [token, setToken] = useState(storedState.token);
  const [secret, setSecret] = useState(storedState.secret);
  const [valid, setValid] = useState(storedState.valid);
  const [algorithm, setAlgorithm] = useState(storedState.algorithm);
  const [mode, setMode] = useState(storedState.mode);

  const updateState = function(update: Partial<JwtState>) {
    const keyCallbackMap = {
      payload: setPayload,
      token: setToken,
      secret: setSecret,
      valid: setValid,
      algorithm: setAlgorithm,
      mode: setMode
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('jwtState', JSON.stringify(storedState));
  }

  const updatePayload = function(payload: string) {
    const token = jwt.encode(payload, secret, algorithm);
    updateState({
      payload,
      token,
      valid: true
    });
  }

  const updateToken = function(token: string) {
    try {
      const payload = jwt.decode(token, secret, false, algorithm);
      updateState({
        token,
        payload,
        valid: true
      });
    } catch (e) {
      console.warn(e);

      try {
        const payload = jwt.decode(token, secret, true, algorithm);

        updateState({
          token,
          valid: false,
          payload
        });
      } catch (e) {
        console.warn(e);

        updateState({
          token,
          valid: false,
          payload: ''
        });
      }
    }
  }

  const updateSecret = function(secret: string) {
    if (mode === 'generate') {
      const token = jwt.encode(payload, secret, algorithm);
      updateState({
        secret,
        token
      });
    }

    if (mode === 'inspect') {
      const payload = jwt.decode(token, secret, true, algorithm);

      try {
        jwt.decode(token, secret, false, algorithm);
        updateState({
          secret,
          payload,
          valid: true
        });
      } catch (e) {
        console.warn(e);
        updateState({
          secret,
          payload,
          valid: false
        });
      }
    }
  }

  const updateAlgorithm = function(algorithm: Algorithm) {
    const token = jwt.encode(payload, secret, algorithm);
    updateState({ algorithm, token });
  }

  const updateMode = function(mode: JwtToolMode) {
    updateState({ mode });
  }

  return <>
    <section>
      <h2>JWT inspection & generation</h2>
    </section>
    <section>
      <button className={`smaller ${mode === 'generate' ? 'active' : ''}`} onClick={() => updateMode('generate')} >Generate token</button>
      <button className={`smaller ${mode === 'inspect' ? 'active' : ''}`} onClick={() => updateMode('inspect')} >Inspect token</button>
    </section >
    <h3>Token</h3>
    <InputTextarea value={token} onChange={updateToken} disabled={mode !== 'inspect'} className={mode === 'inspect' ? valid ? 'valid' : 'invalid' : ''} />
    <h3>Payload</h3>
    <InputTextarea value={payload} onChange={updatePayload} disabled={mode !== 'generate'} />
    <section>
      <span>Secret</span><InputText value={secret} onChange={updateSecret} />
    </section>
    <section>
      <span>Algorithm</span>
      <InputSelect options={algorithms} value={algorithm} onChange={updateAlgorithm} />
    </section>
  </>
}
