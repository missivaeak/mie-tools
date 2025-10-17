import "./input-toggle.css";

type InputToggleProps = {
  className?: string;
  label: string;
  value: boolean;
  onToggle: () => void;
}

export default function InputToggle({ label, value, onToggle, className }: InputToggleProps) {
  const id = Math.random().toString().slice(2);

  return (
    <label htmlFor={id} className={`input-toggle${value ? ' active' : ''}${className ? ` ${className}` : ''}`} >
      < input type="checkbox" id={id} checked={value} onChange={onToggle} />
      {label}
    </label >
  );
}
