import type { ChangeEvent } from "react";
import "./input-select.css"

type InputSelectProps<T> = {
  value: T;
  onChange: (change: T) => void;
  options: readonly T[] | T[];
}


export default function InputSelect<T extends string = string>({ value, onChange, options }: InputSelectProps<T>) {
  function onChangeHtml(event: ChangeEvent<HTMLSelectElement>) {
    const change = event.target.value;
    // @ts-expect-error
    onChange(change);
  }

  return <select className="input-select" onChange={onChangeHtml} value={value}>
    {options.map((option, i) => <option key={`${option}-${i}`}>{option}</option>)}
  </select >
}
