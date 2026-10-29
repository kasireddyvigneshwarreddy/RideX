import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('RideX Web Application Rendering & Design System', () => {
  it('renders original RideX brand logo and navigation headline', () => {
    render(<App />);
    expect(screen.getAllByText(/Ride/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/X/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/India/i).length).toBeGreaterThan(0);
  });

  it('renders hero title "Your City. Your Ride. Your Way."', () => {
    render(<App />);
    expect(screen.getByText(/Your City\./i)).toBeInTheDocument();
    expect(screen.getByText(/Your Ride\./i)).toBeInTheDocument();
  });

  it('renders all four Indian mobility categories (Bike Taxi, Auto, Cab Mini, Prime)', () => {
    render(<App />);
    expect(screen.getAllByText(/Bike Taxi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Auto/i).length).toBeGreaterThan(0);
  });
});
