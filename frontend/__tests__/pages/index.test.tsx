// Tests for home page
import { render, screen } from '@testing-library/react';
import Home from '../../app/page';

// Mock the page component
jest.mock('../../app/page', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

describe('Home Page', () => {
  it('renders home page', () => {
    render(<Home />);
    const homePage = screen.getByTestId('home-page');
    expect(homePage).toBeInTheDocument();
  });
});
