import { useEffect, useRef, useState } from "react";
import InputTextarea from "../components/InputTextarea";
import InputSelect from "../components/InputSelect";
import bwipjs from "bwip-js/browser";
import barcodeMakerConfig from "./configs/barcodeMakerConfig.json"

const barcodeTypes = [...barcodeMakerConfig.selectBarcodeTypes, ...barcodeMakerConfig.barcodeTypes];
const barcodeTypes2d = barcodeMakerConfig.barcodeTypes2d;
const barcodeTypesStacked = barcodeMakerConfig.barcodeTypesStacked;

type BarcodeToolState = {
  text: string;
  barcodeType: string;
  valid: boolean;
  scale: string;
  barcodeText: string;
}

const defaultState = `{
  "text": "123456789012",
  "barcodeType": "code128",
  "valid": true,
  "scale": "1.0",
  "barcodeText": "123456789012"
}`

function getBarcodeRatio(barcodeType: string) {
  switch (true) {
    case barcodeTypes2d.includes(barcodeType): {
      return 1;
    }
    case barcodeTypesStacked.includes(barcodeType): {
      return 0.5;
    }
    default: {
      return 0.3;
    }
  }
}

export default function BarcodeMakerTool() {
  const storedState: BarcodeToolState = JSON.parse(localStorage.getItem('barcodeState') ?? defaultState);
  const [text, setText] = useState(storedState.text);
  const [barcodeType, setBarcodeType] = useState(storedState.barcodeType);
  const [valid, setValid] = useState(storedState.valid);
  const [scale, setScale] = useState(storedState.scale);
  const [barcodeText, setBarcodeText] = useState(storedState.barcodeText);
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const updateState = function(update: Partial<BarcodeToolState>) {
    const keyCallbackMap = {
      text: setText,
      barcodeType: setBarcodeType,
      valid: setValid,
      scale: setScale,
      barcodeText: setBarcodeText
    }

    Object.entries(update).forEach(([key, value]) => {
      // @ts-expect-error
      storedState[key] = value;
      // @ts-expect-error
      keyCallbackMap[key](value)
    });

    localStorage.setItem('barcodeState', JSON.stringify(storedState));
  }

  useEffect(() => {
    if (!text) {
      canvasRef.current?.getContext('2d')?.reset();
    }

    if (text && barcodeType && canvasRef.current) {
      try {
        canvasRef.current.getContext("2d")?.fill();

        bwipjs.toCanvas(canvasRef.current, {
          backgroundcolor: "#ffffff",
          bordercolor: "#999999",
          text,
          bcid: barcodeType,
          scale: 1,
          includetext: false,
          textxalign: 'center',
          textyoffset: -10,
          textsize: 20,
          width: 120,
          height: 120 * getBarcodeRatio(barcodeType)
        });
        updateState({ valid: true, barcodeText: text })
      } catch (e) {
        console.warn(e);
        updateState({ valid: false })
      }
    }
  }, [text, barcodeType, scale]);

  const updateText = function(text: string) {
    updateState({ text: String.raw({ raw: text }) });
  }

  const updateBarcodeType = function(barcodeType: string) {
    updateState({ barcodeType });
  }

  // const updateScale = function(scale: string) {
  //   updateState({ scale })
  // }

  return <>
    <section>
      <h2>Barcode generation</h2>
    </section>
    <h3>Text</h3>
    <InputTextarea
      value={text}
      onChange={updateText}
      className={!valid ? 'invalid' : 'valid'}
    />
    <span>Barcode type:</span>
    <InputSelect options={barcodeTypes} value={barcodeType} onChange={updateBarcodeType} />
    {/* <span>Scaling:</span> */}
    {/* <InputText value={scale} onChange={updateScale} maxSize={4} /> */}
    <section>
      <canvas ref={canvasRef} />
    </section>
    <section>
      <pre>{barcodeText.replace(/\n/g, '\\n')}</pre>
    </section>
  </>
}
