/**
 * Tests para el componente Card y sus subcomponentes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card, { CardHeader, CardBody, CardFooter } from './Card';

describe('Card Component', () => {
  it('debe renderizar children correctamente', () => {
    render(<Card>Contenido de prueba</Card>);
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('debe usar variante default por defecto', () => {
    render(<Card>Default</Card>);
    const card = screen.getByText('Default').parentElement;
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border-2 border-[#154212]/5');
  });

  it('debe aplicar variante elevated correctamente', () => {
    render(<Card variant="elevated">Elevated</Card>);
    const card = screen.getByText('Elevated').parentElement;
    expect(card).toHaveClass('shadow-[0_8px_32px_rgba(29,29,3,0.08)]');
  });

  it('debe aplicar variante outlined correctamente', () => {
    render(<Card variant="outlined">Outlined</Card>);
    const card = screen.getByText('Outlined').parentElement;
    expect(card).toHaveClass('bg-transparent');
    expect(card).toHaveClass('border-2 border-[#154212]/20');
  });

  it('debe aplicar variante filled correctamente', () => {
    render(<Card variant="filled">Filled</Card>);
    const card = screen.getByText('Filled').parentElement;
    expect(card).toHaveClass('bg-[#154212]/5');
  });

  it('debe usar padding md por defecto', () => {
    render(<Card>Medium Padding</Card>);
    const card = screen.getByText('Medium Padding').parentElement;
    expect(card).toHaveClass('p-6');
  });

  it('debe aplicar padding sm correctamente', () => {
    render(<Card padding="sm">Small Padding</Card>);
    const card = screen.getByText('Small Padding').parentElement;
    expect(card).toHaveClass('p-4');
  });

  it('debe aplicar padding lg correctamente', () => {
    render(<Card padding="lg">Large Padding</Card>);
    const card = screen.getByText('Large Padding').parentElement;
    expect(card).toHaveClass('p-8');
  });

  it('debe aplicar hover cuando hover es true', () => {
    render(<Card hover>Hoverable</Card>);
    const card = screen.getByText('Hoverable').parentElement;
    expect(card).toHaveClass('hover:translate-y-[-4px]');
  });

  it('debe ser clickable cuando onClick se proporciona', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByText('Clickable').parentElement;
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe tener tabIndex cuando es clickable', () => {
    render(<Card onClick={vi.fn()}>Clickable</Card>);
    const card = screen.getByText('Clickable').parentElement;
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('debe responder a teclado cuando es clickable', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByText('Clickable').parentElement;
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe aplicar className personalizado', () => {
    render(<Card className="custom-class">Custom</Card>);
    const card = screen.getByText('Custom').parentElement;
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader Component', () => {
  it('debe renderizar título correctamente', () => {
    render(<CardHeader title="Título" />);
    expect(screen.getByText('Título')).toBeInTheDocument();
  });

  it('debe renderizar subtítulo cuando se proporciona', () => {
    render(<CardHeader title="Título" subtitle="Subtítulo" />);
    expect(screen.getByText('Subtítulo')).toBeInTheDocument();
  });

  it('debe renderizar ícono cuando se proporciona', () => {
    render(<CardHeader title="Título" icon="star" />);
    const icon = screen.getByText('star');
    expect(icon).toHaveClass('material-symbols-outlined');
  });

  it('debe aplicar color de ícono personalizado', () => {
    render(<CardHeader title="Título" icon="star" iconColor="text-red-500" />);
    const icon = screen.getByText('star');
    expect(icon).toHaveClass('text-red-500');
  });

  it('debe renderizar acción cuando se proporciona', () => {
    render(<CardHeader title="Título" action={<button>Acción</button>} />);
    expect(screen.getByText('Acción')).toBeInTheDocument();
  });
});

describe('CardBody Component', () => {
  it('debe renderizar children correctamente', () => {
    render(<CardBody>Contenido del body</CardBody>);
    expect(screen.getByText('Contenido del body')).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    render(<CardBody className="custom-class">Body</CardBody>);
    expect(screen.getByText('Body')).toHaveClass('custom-class');
  });
});

describe('CardFooter Component', () => {
  it('debe renderizar children correctamente', () => {
    render(<CardFooter>Contenido del footer</CardFooter>);
    expect(screen.getByText('Contenido del footer')).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    render(<CardFooter className="custom-class">Footer</CardFooter>);
    expect(screen.getByText('Footer')).toHaveClass('custom-class');
  });
});
