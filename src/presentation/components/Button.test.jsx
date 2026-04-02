/**
 * Tests para el componente Button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

describe('Button Component', () => {
  it('debe renderizar el texto del botón correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('debe usar la variante primary por defecto', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[#2D5A27]');
  });

  it('debe aplicar la variante secondary correctamente', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[#F4C430]');
  });

  it('debe aplicar la variante outline correctamente', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-2 border-[#2D5A27]');
  });

  it('debe aplicar la variante danger correctamente', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[#C41E3A]');
  });

  it('debe usar el tamaño md por defecto', () => {
    render(<Button>Medium</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6 py-3');
  });

  it('debe aplicar el tamaño sm correctamente', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4 py-2');
  });

  it('debe aplicar el tamaño lg correctamente', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-8 py-4');
  });

  it('debe estar disabled cuando la prop disabled es true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('debe mostrar loading spinner cuando loading es true', () => {
    render(<Button loading>Loading</Button>);
    const spinner = screen.getByText('progress_activity');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('debe llamar a onClick cuando se hace click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no debe llamar a onClick cuando está disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('no debe llamar a onClick cuando está loading', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('debe aplicar fullWidth correctamente', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('debe mostrar leftIcon cuando se proporciona', () => {
    render(<Button leftIcon="star">With Icon</Button>);
    const icon = screen.getAllByText('star')[0];
    expect(icon).toHaveClass('material-symbols-outlined');
  });

  it('debe mostrar rightIcon cuando se proporciona', () => {
    render(<Button rightIcon="arrow_forward">With Icon</Button>);
    const icon = screen.getAllByText('arrow_forward')[0];
    expect(icon).toHaveClass('material-symbols-outlined');
  });

  it('debe aplicar className personalizado', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('debe tener type="button" por defecto', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('debe tener type="submit" cuando se especifica', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
