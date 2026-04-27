import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  onCommit: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  integer?: boolean;
  /** 入力モード ("decimal" | "numeric") */
  inputMode?: 'decimal' | 'numeric';
  'aria-label'?: string;
}

/**
 * 数値入力コンポーネント。
 * - 編集中は内部で文字列を保持するため、全消し → 再入力ができる。
 * - 確定 (blur / Enter) のタイミングで onCommit を呼び、min/max でクランプする。
 * - 外部 value が変更されたら表示を同期する。
 */
export function NumberInput({
  value,
  onCommit,
  min,
  max,
  step,
  className,
  disabled,
  placeholder,
  integer,
  inputMode = 'decimal',
  ...rest
}: Props) {
  const [text, setText] = useState<string>(formatDisplay(value));
  const lastValueRef = useRef(value);

  // 外部から value が更新されたら表示を追従 (編集中でない前提)
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      setText(formatDisplay(value));
    }
  }, [value]);

  const commit = () => {
    // 無効な入力 (空 / 記号のみ) → 元に戻す
    if (text.trim() === '' || text === '-' || text === '.' || text === '-.') {
      setText(formatDisplay(value));
      return;
    }
    let n = Number(text);
    if (!Number.isFinite(n)) {
      setText(formatDisplay(value));
      return;
    }
    if (integer) n = Math.trunc(n);
    if (typeof min === 'number') n = Math.max(min, n);
    if (typeof max === 'number') n = Math.min(max, n);

    setText(formatDisplay(n));
    lastValueRef.current = n;
    if (n !== value) onCommit(n);
  };

  return (
    <input
      {...rest}
      type="text"
      inputMode={inputMode}
      pattern={integer ? '[0-9]*' : '[0-9.]*'}
      value={text}
      disabled={disabled}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.currentTarget as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
          setText(formatDisplay(value));
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      className={className}
    />
  );
}

function formatDisplay(n: number): string {
  if (!Number.isFinite(n)) return '';
  // 小数点以下を不要に表示しない
  return Number.isInteger(n) ? String(n) : String(n);
}
