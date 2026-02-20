type Props = {
  onSubmit: (file: File) => Promise<void>;
  disabled?: boolean;
};

export default function ImageUploadPanel({ onSubmit, disabled }: Props) {
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const target = event.currentTarget;
        const input = target.elements.namedItem('image_file') as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (!file) return;
        await onSubmit(file);
      }}
    >
      <label htmlFor="image-file">Image</label>
      <input id="image-file" name="image_file" type="file" accept="image/*" />
      <button type="submit" disabled={disabled}>Detect Image</button>
    </form>
  );
}
