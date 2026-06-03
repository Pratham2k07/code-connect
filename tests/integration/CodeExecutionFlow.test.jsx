import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IDEMenuBar } from '../../src/components/ide/IDEMenuBar';
import { executeCode, isPistonSupported } from '../../src/lib/piston';
import { SandpackProvider } from "@codesandbox/sandpack-react";

vi.mock('../../src/lib/piston', () => ({
  executeCode: vi.fn(),
  isPistonSupported: vi.fn(),
}));

describe('Code Execution Flow (IDEMenuBar)', () => {
  const mockSetShowExplorer = vi.fn();
  const mockSetShowTerminal = vi.fn();
  const mockSetMockTerminalLogs = vi.fn();
  const mockSetActiveTerminalTab = vi.fn();
  
  const defaultProps = {
    setShowExplorer: mockSetShowExplorer,
    showExplorer: false,
    setShowTerminal: mockSetShowTerminal,
    showTerminal: false,
    setMockTerminalLogs: mockSetMockTerminalLogs,
    setActiveTerminalTab: mockSetActiveTerminalTab,
    terminalStdin: '',
    activeFilePath: '/main.js',
    editorRef: { current: { getValue: () => 'console.log("test");' } }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    isPistonSupported.mockReturnValue(true);
  });

  const renderMenuBar = (props = {}) => {
    return render(
      <SandpackProvider>
        <IDEMenuBar {...defaultProps} {...props} />
      </SandpackProvider>
    );
  };

  it('sends correct code to compiler when Run is clicked', async () => {
    executeCode.mockResolvedValueOnce({
      compile: { code: 0 },
      run: { code: 0, output: 'test output' }
    });

    renderMenuBar();
    const runBtn = screen.getAllByRole('button', { name: /run/i })[1];
    fireEvent.click(runBtn);

    expect(mockSetShowTerminal).toHaveBeenCalledWith(true);
    expect(mockSetActiveTerminalTab).toHaveBeenCalledWith('output');

    await waitFor(() => {
      expect(executeCode).toHaveBeenCalledWith('/main.js', 'console.log("test");', '');
    });
  });

  it('displays compiler output correctly on success', async () => {
    executeCode.mockResolvedValueOnce({
      compile: { code: 0 },
      run: { code: 0, output: 'Hello from code!' }
    });

    renderMenuBar();
    fireEvent.click(screen.getAllByRole('button', { name: /run/i })[1]);

    await waitFor(() => {
      // The logs should be updated with the output
      expect(mockSetMockTerminalLogs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'text', text: 'Hello from code!' }),
          expect.objectContaining({ type: 'info', text: '[Execution finished successfully ✓]' })
        ])
      );
    });
  });

  it('shows error output on invalid code (compilation error)', async () => {
    executeCode.mockResolvedValueOnce({
      compile: { code: 1, output: 'SyntaxError: Unexpected identifier' },
      run: {}
    });

    renderMenuBar();
    fireEvent.click(screen.getAllByRole('button', { name: /run/i })[1]);

    await waitFor(() => {
      expect(mockSetMockTerminalLogs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'error', text: 'SyntaxError: Unexpected identifier' })
        ])
      );
    });
  });

  it('shows error when network or compiler API fails', async () => {
    executeCode.mockRejectedValueOnce(new Error('Network error'));

    renderMenuBar();
    fireEvent.click(screen.getAllByRole('button', { name: /run/i })[1]);

    await waitFor(() => {
      expect(mockSetMockTerminalLogs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'error', text: '✗ Network error' })
        ])
      );
    });
  });

  it('disables run button and prevents rapid clicking', async () => {
    let resolveExecute;
    const executePromise = new Promise(resolve => { resolveExecute = resolve; });
    executeCode.mockReturnValueOnce(executePromise);

    renderMenuBar();
    const runBtn = screen.getAllByRole('button', { name: /run/i })[1];
    
    // First click
    fireEvent.click(runBtn);
    
    // Button should show loading state and be disabled
    expect(runBtn).toHaveTextContent('Running...');
    expect(runBtn).toBeDisabled();

    // Second click (should be ignored due to disabled state in testing library, 
    // but we can ensure executeCode is only called once)
    fireEvent.click(runBtn);
    expect(executeCode).toHaveBeenCalledTimes(1);

    // Resolve the promise to finish
    resolveExecute({ run: { code: 0, output: 'done' } });
    
    await waitFor(() => {
      expect(runBtn).not.toBeDisabled();
      expect(runBtn).toHaveTextContent('Run');
    });
  });

  it('handles empty code execution without crashing', async () => {
    executeCode.mockResolvedValueOnce({
      run: { code: 0, output: '' }
    });

    renderMenuBar({
      editorRef: { current: { getValue: () => '' } }
    });

    fireEvent.click(screen.getAllByRole('button', { name: /run/i })[1]);

    await waitFor(() => {
      expect(executeCode).toHaveBeenCalledWith('/main.js', '', '');
      expect(mockSetMockTerminalLogs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ type: 'info', text: '[Execution finished successfully ✓]' })
        ])
      );
    });
  });
  
  it('handles unsupported extensions gracefully', async () => {
    isPistonSupported.mockReturnValueOnce(false);
    
    renderMenuBar({
      activeFilePath: '/styles.css'
    });
    
    fireEvent.click(screen.getAllByRole('button', { name: /run/i })[1]);
    
    expect(mockSetMockTerminalLogs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'error', text: expect.stringContaining('Cannot run file type') })
      ])
    );
    expect(executeCode).not.toHaveBeenCalled();
  });
});
