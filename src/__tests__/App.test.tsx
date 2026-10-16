import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component Integration & UI Controls', () => {
  it('renders title, stats bar, and 4x4 grid of 16 cards by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Adaptive Memory/i })).toBeInTheDocument();
    expect(screen.getByTestId('game-board-grid')).toBeInTheDocument();

    // 16 cards in 4x4 grid
    const cards = screen.getAllByRole('button', { name: /Card \d+:/i });
    expect(cards.length).toBe(16);

    // Initial stats
    expect(screen.getByTestId('moves-counter-value')).toHaveTextContent('0');
    expect(screen.getByTestId('pairs-counter-value')).toHaveTextContent('0');
  });

  it('opens and closes instructions modal with documented rules', () => {
    render(<App />);

    const instructionsBtn = screen.getByTestId('instructions-button');
    fireEvent.click(instructionsBtn);

    expect(screen.getByText(/How to Play & Adaptation Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Documented Performance-Driven Adaptation Matrix/i)).toBeInTheDocument();

    const closeBtn = screen.getByTestId('close-instructions-button');
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/How to Play & Adaptation Guide/i)).not.toBeInTheDocument();
  });

  it('opens seed control modal and allows custom seed input', () => {
    render(<App />);

    const seedBtn = screen.getByTestId('seed-control-button');
    fireEvent.click(seedBtn);

    expect(screen.getByText(/Reproducible PRNG Seed/i)).toBeInTheDocument();
    const input = screen.getByTestId('seed-input-field');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'CUSTOM-SEED-42' } });
    const applyBtn = screen.getByTestId('apply-seed-button');
    fireEvent.click(applyBtn);

    // Seed button should now display new seed
    expect(screen.getByTestId('seed-control-button')).toHaveTextContent('CUSTOM-SEED-42');
  });

  it('opens demonstration suite with all 5 automated checks available', () => {
    render(<App />);

    const demoBtn = screen.getByTestId('demo-suite-button');
    fireEvent.click(demoBtn);

    expect(screen.getByText(/Demonstrations & State Verification Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Demonstrate a Match/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Demonstrate a Mismatch & Flip-back/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Rapid Clicks \(Third Selection Guard\)/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Restart During Pending Timer/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Performance-Driven Difficulty Change/i)).toBeInTheDocument();

    const closeBtn = screen.getByTestId('close-demo-suite-button');
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Demonstrations & State Verification Suite/i)).not.toBeInTheDocument();
  });

  it('clicking restart button cleanly resets board and counters', () => {
    render(<App />);

    const firstCard = screen.getByTestId('card-0');
    fireEvent.click(firstCard);

    // Restart
    const restartBtn = screen.getByTestId('restart-game-button');
    fireEvent.click(restartBtn);

    expect(screen.getByTestId('moves-counter-value')).toHaveTextContent('0');
    expect(screen.getByTestId('pairs-counter-value')).toHaveTextContent('0');
  });
});
