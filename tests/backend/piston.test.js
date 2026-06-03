import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeCode, isPistonSupported } from '../../src/lib/piston';

global.fetch = vi.fn();

describe('piston code execution API (Wandbox)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isPistonSupported', () => {
    it('returns true for supported extensions', () => {
      expect(isPistonSupported('test.js')).toBe(true);
      expect(isPistonSupported('main.cpp')).toBe(true);
      expect(isPistonSupported('script.py')).toBe(true);
    });

    it('returns false for unsupported extensions', () => {
      expect(isPistonSupported('style.css')).toBe(false);
      expect(isPistonSupported('document.txt')).toBe(false);
      expect(isPistonSupported('config.json')).toBe(false);
    });

    it('handles empty or invalid filenames', () => {
      expect(isPistonSupported('')).toBe(false);
      expect(isPistonSupported(null)).toBe(false);
      expect(isPistonSupported(undefined)).toBe(false);
    });
  });

  describe('executeCode', () => {
    it('throws error for unsupported language', async () => {
      await expect(executeCode('test.txt', 'hello')).rejects.toThrow('Language not supported');
    });

    it('handles successful execution', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          program_output: 'Hello, World!',
        }),
      });

      const result = await executeCode('test.js', 'console.log("Hello, World!")');
      
      expect(result.run.code).toBe(0);
      expect(result.run.output).toBe('Hello, World!');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('handles compilation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          compiler_error: 'SyntaxError: Unexpected token',
        }),
      });

      const result = await executeCode('test.js', 'console.log(');
      
      expect(result.compile.code).toBe(1);
      expect(result.compile.stderr).toBe('SyntaxError: Unexpected token');
    });

    it('falls back to next compiler on OCI runtime error', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          program_error: 'OCI runtime error',
        }),
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          program_output: 'Success from fallback',
        }),
      });

      const result = await executeCode('test.js', 'console.log("fallback")');
      
      expect(result.run.output).toBe('Success from fallback');
      expect(fetch).toHaveBeenCalledTimes(2); // Tried two compilers
    });

    it('throws error when all compilers fail (network failure)', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(executeCode('test.js', 'console.log("test")')).rejects.toThrow('All compilers failed');
    });
    
    it('handles empty code execution', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          program_output: '',
        }),
      });

      const result = await executeCode('test.js', '');
      expect(result.run.code).toBe(0);
      expect(result.run.output).toBe('');
    });
  });
});
