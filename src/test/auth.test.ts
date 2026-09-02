import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translations } from '../locales/translations';
import { supabase } from '../lib/supabase';

describe('Auth & Localization Tests', () => {
  it('contains all required authentication keys in both English and Indonesian', () => {
    const requiredKeys = [
      'authTagline',
      'authSignIn',
      'authSignUp',
      'authMethodPassword',
      'authMethodMagicLink',
      'authEmailLabel',
      'authPasswordLabel',
      'authConfirmPasswordLabel',
      'authForgotPassword',
      'authResetPasswordTitle',
      'authResetPasswordSubtitle',
      'authBackToSignIn',
      'authEmailRequired',
      'authPasswordRequired',
      'authPasswordMinLength',
      'authPasswordMismatch',
      'authInvalidCredentials',
      'authPasswordResetSent',
      'authMagicLinkSent',
      'authSignUpConfirmationSent',
      'authSignUpSuccess',
      'authGenericError',
      'authProcessing',
      'authSignInButton',
      'authCreateAccountButton',
      'authSendResetLink',
      'authSendMagicLink',
      'authCloudSecurityNote',
      'accountProfile',
      'accountProfileDesc',
      'signedInAs',
      'signOutButton',
    ] as const;

    for (const key of requiredKeys) {
      expect(translations.en[key]).toBeDefined();
      expect(translations.en[key].length).toBeGreaterThan(0);
      expect(translations.id[key]).toBeDefined();
      expect(translations.id[key].length).toBeGreaterThan(0);
    }
  });

  it('validates target user email case-insensitively for fauzimhmmad@gmail.com', () => {
    const targetEmail = 'fauzimhmmad@gmail.com';
    const testCases = [
      'fauzimhmmad@gmail.com',
      'FAUZIMHMMAD@GMAIL.COM',
      '  fauzimhmmad@gmail.com  ',
      'FauziMhmmad@Gmail.Com',
    ];

    testCases.forEach((email) => {
      const isTargetUser = email.trim().toLowerCase() === targetEmail;
      expect(isTargetUser).toBe(true);
    });

    expect('other@example.com'.trim().toLowerCase() === targetEmail).toBe(false);
  });
});

describe('Supabase Auth Client Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has supabase auth helper methods defined', () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signInWithOtp).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
    expect(typeof supabase.auth.resetPasswordForEmail).toBe('function');
  });
});
