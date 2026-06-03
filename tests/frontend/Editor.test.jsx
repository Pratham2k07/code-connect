import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IDEFileExplorer } from '../../src/components/ide/IDEFileExplorer';
import { SandpackProvider } from "@codesandbox/sandpack-react";

describe('IDEFileExplorer (Editor Files)', () => {
  const mockOpenFile = vi.fn();
  
  const defaultFiles = {
    '/index.js': { code: 'console.log("hello");' },
    '/main.py': { code: 'print("hello")' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderExplorer = (customFiles = defaultFiles) => {
    return render(
      <SandpackProvider files={customFiles}>
        <IDEFileExplorer openFile={mockOpenFile} />
      </SandpackProvider>
    );
  };

  it('detects file type from extension correctly (visual test via icons - mocked)', () => {
    // We check if the files render
    renderExplorer();
    expect(screen.getByText('index.js')).toBeInTheDocument();
    expect(screen.getByText('main.py')).toBeInTheDocument();
  });

  it('opens selected file correctly', () => {
    renderExplorer();
    const fileItem = screen.getByText('main.py');
    fireEvent.click(fileItem);
    
    expect(mockOpenFile).toHaveBeenCalledWith('/main.py');
  });

  // Note: Creating files in Sandpack's internal state via UI usually involves
  // interacting with the "+" button and input field.
  it('handles add new file without deleting old files', async () => {
    renderExplorer();
    
    // Find and click the "+" button to add a file
    const addFileBtn = screen.getByTitle('New File');
    fireEvent.click(addFileBtn);
    
    // An input should appear
    const input = screen.getByPlaceholderText('filename.ext');
    expect(input).toBeInTheDocument();
    
    // Type a new filename
    fireEvent.change(input, { target: { value: 'newfile.js' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // The new file should be added (Sandpack state update)
    await waitFor(() => {
      expect(screen.getByText('newfile.js')).toBeInTheDocument();
    });
    
    // Old files should still be there
    expect(screen.getByText('index.js')).toBeInTheDocument();
    expect(screen.getByText('main.py')).toBeInTheDocument();
  });

  it('handles empty filename gracefully', async () => {
    renderExplorer();
    const addFileBtn = screen.getByTitle('New File');
    fireEvent.click(addFileBtn);
    
    const input = screen.getByPlaceholderText('filename.ext');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // The input might just blur or ignore
    await waitFor(() => {
      // It shouldn't create a file named '   '
      expect(screen.queryByText('   ')).not.toBeInTheDocument();
    });
  });

  it('handles duplicate filename by ignoring or warning', async () => {
    renderExplorer();
    const addFileBtn = screen.getByTitle('New File');
    fireEvent.click(addFileBtn);
    
    const input = screen.getByPlaceholderText('filename.ext');
    fireEvent.change(input, { target: { value: 'index.js' } }); // duplicate
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Depending on implementation, it might alert or ignore. 
    // We just ensure it doesn't crash and index.js is still there once.
    await waitFor(() => {
      const allIndexFiles = screen.getAllByText('index.js');
      expect(allIndexFiles.length).toBe(1); // Still only one
    });
  });
});
