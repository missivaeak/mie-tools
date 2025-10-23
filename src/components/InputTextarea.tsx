import ReactCodeMirror, { type ReactCodeMirrorProps, EditorView } from "@uiw/react-codemirror";
import "./input-textarea.css";
import { useEffect, useState, type MouseEvent } from "react";

type CodeTextareaProps = Pick<ReactCodeMirrorProps, 'value' | 'onChange'> & {
  disabled?: boolean;
  className?: string;
};

function Clipboard() { return <>&#128203;</> }
function Checkmark() { return <>&#10003;</> }

export default function CodeTextarea({ value, onChange, disabled, className }: CodeTextareaProps) {
  const [copyIcon, setCopyIcon] = useState(<Clipboard />)

  const onCopy = function (_: MouseEvent<HTMLButtonElement>) {
    setCopyIcon(<Checkmark />)
    navigator.clipboard.writeText(value ?? '');
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopyIcon(<Clipboard />)
    }, 1500)

    return () => {
      clearTimeout(timeout);
    }
  }, [copyIcon]);

  return <div className={`input-textarea${disabled ? ' disabled' : ''}${className ? ` ${className}` : ''}`} >
    <ReactCodeMirror
      readOnly={disabled}
      editable={!disabled}
      extensions={[EditorView.lineWrapping]}
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={onChange}
      height={'190px'}
      basicSetup={{
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
      }}
    />
    <button className="copy-button" onClick={onCopy}>{copyIcon}</button>
  </div >
}
