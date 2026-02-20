import { render, screen } from '@testing-library/react';
import App from './App';

it('renders detect form and result disclaimer placeholder', () => {
  render(<App />);

  expect(screen.getByText(/AI 内容鉴别/i)).toBeInTheDocument();
  expect(screen.getByText(/检测结果仅供参考/i)).toBeInTheDocument();
});
