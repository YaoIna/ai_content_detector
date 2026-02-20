import { useState } from 'react';

type Props = {
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
};

export default function TextInputPanel({ onSubmit, disabled }: Props) {
  const [text, setText] = useState('');

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        await onSubmit(text);
      }}
    >
      <label htmlFor="text-input">Text</label>
      <textarea
        id="text-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={6}
        placeholder="Paste text here"
      />
      <button type="submit" disabled={disabled}>Detect Text</button>
    </form>
  );
}
