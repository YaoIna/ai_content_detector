import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import { detectText } from './lib/api';

vi.mock('./lib/api', async () => {
  const actual = await vi.importActual<typeof import('./lib/api')>('./lib/api');
  return {
    ...actual,
    detectText: vi.fn(),
    detectImage: vi.fn()
  };
});

it('renders editorial layout sections', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /AI 内容鉴别/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /文本检测/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /图片检测/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /检测报告/i })).toBeInTheDocument();
  expect(screen.getByText(/检测结果仅供参考/i)).toBeInTheDocument();
});

it('shows loading state in result area and disables submit buttons until request finishes', async () => {
  let resolveRequest: ((value: Awaited<ReturnType<typeof detectText>>) => void) | null = null;

  vi.mocked(detectText).mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
  );

  render(<App />);

  const textarea = screen.getByLabelText('输入文本');
  fireEvent.change(textarea, {
    target: { value: 'This is a sufficiently long text input for loading state testing.' }
  });

  const textButton = screen.getByRole('button', { name: '开始文本检测' });
  const imageButton = screen.getByRole('button', { name: '开始图片检测' });

  fireEvent.click(textButton);

  expect(screen.getByText('正在检测中...')).toBeInTheDocument();
  expect(textButton).toBeDisabled();
  expect(imageButton).toBeDisabled();

  resolveRequest?.({
    type: 'text',
    ai_probability: 90,
    confidence_band: 'high',
    explanations: ['Signal A'],
    disclaimer: '检测结果仅供参考'
  });

  await waitFor(() => {
    expect(screen.queryByText('正在检测中...')).not.toBeInTheDocument();
  });

  expect(textButton).not.toBeDisabled();
  expect(imageButton).not.toBeDisabled();
});
