import type { ChangeEvent } from "react";
import "./input-text.css"

type InputTextProps<T extends string = string> = {
  value: T;
  onChange: (change: T) => void;
  className?: string;
  maxSize?: number;
}

export default function InputText({ value, onChange, className, maxSize }: InputTextProps) {
  function onChangeHtml(event: ChangeEvent<HTMLInputElement>) {
    const change = event.target.value;
    onChange(change);
  }

  return <input className={`input-text${className ? ` ${className}` : ''}`} size={maxSize} maxLength={maxSize} type="text" value={value} onChange={onChangeHtml} />
}
