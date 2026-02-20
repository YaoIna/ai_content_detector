import { render, screen } from '@testing-library/react';
import App from './App';

it('renders editorial layout sections', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /AI 内容鉴别/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /文本检测/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /图片检测/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /检测报告/i })).toBeInTheDocument();
  expect(screen.getByText(/检测结果仅供参考/i)).toBeInTheDocument();
});
