import type { ChangeEvent } from "react";
import "./input-text.css"

type InputTextProps<T extends string = string> = {
  value: T;
  onChange: (change: T) => void;
}

export default function InputText({ value, onChange }: InputTextProps) {
  function onChangeHtml(event: ChangeEvent<HTMLInputElement>) {
    const change = event.target.value;
    onChange(change);
  }

  return <input className="input-text" type="text" value={value} onChange={onChangeHtml} />
}
