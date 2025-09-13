// Tests for Avatar component
import { render, screen } from '@testing-library/react';
import Avatar from '../../components/Avatar';

describe('Avatar Component', () => {
  it('renders with default props', () => {
    render(<Avatar />);
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
  });

  it('renders with custom src', () => {
    const src = 'https://example.com/avatar.jpg';
    render(<Avatar src={src} />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', src);
  });

  it('renders with custom size', () => {
    const size = 64;
    render(<Avatar size={size} />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('width', size.toString());
    expect(avatar).toHaveAttribute('height', size.toString());
  });

  it('renders with custom alt text', () => {
    const alt = 'User avatar';
    render(<Avatar alt={alt} />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('alt', alt);
  });
});

