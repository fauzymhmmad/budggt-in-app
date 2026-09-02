import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { AuthScreen } from '../components/auth/AuthScreen';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

describe('App Initial Mount & AuthScreen', () => {
  it('renders App without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('renders AuthScreen properly when wrapped in AuthProvider and LanguageProvider', () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <AuthScreen />
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Budggt\.in/i)).toBeInTheDocument();
    const signInButtons = screen.getAllByRole('button', { name: /^Sign In$/i });
    expect(signInButtons.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByRole('button', { name: /^Create Account$/i })).toBeInTheDocument();
  });

  it('switches language between English and Indonesian in AuthScreen', () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <AuthScreen />
        </AuthProvider>
      </LanguageProvider>
    );

    const idBtn = screen.getByRole('button', { name: /^ID$/i });
    fireEvent.click(idBtn);

    expect(screen.getAllByText(/Masuk/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Daftar Akun/i)).toBeInTheDocument();

    const enBtn = screen.getByRole('button', { name: /^EN$/i });
    fireEvent.click(enBtn);

    const signInButtons = screen.getAllByRole('button', { name: /^Sign In$/i });
    expect(signInButtons.length).toBeGreaterThanOrEqual(1);
  });
});
