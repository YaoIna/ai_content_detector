import { useState } from 'react';

type Props = {
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
};

export default function TextInputPanel({ onSubmit, disabled }: Props) {
  const [text, setText] = useState('');

  return (
    <form
      className="panel-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!text.trim()) return;
        await onSubmit(text);
      }}
    >
      <label htmlFor="text-input">输入文本</label>
      <textarea
        id="text-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={7}
        placeholder="粘贴需要鉴别的文本内容"
      />
      <button type="submit" disabled={disabled}>开始文本检测</button>
    </form>
  );
}
