import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoomsList } from '../../src/pages/RoomsList';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RoomsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { id: 'user1', email: 'test@test.com' } });
    
    // Mock Supabase return for rooms
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: 'room1', name: 'Test Room', language: 'javascript', owner_id: 'user1' }],
        error: null
      }),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'room-new' },
        error: null
      })
    });
  });

  it('renders rooms list and "Start a New Project" card', async () => {
    render(
      <MemoryRouter>
        <RoomsList />
      </MemoryRouter>
    );

    // Using findAllByText or similar, wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Start a New Project')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Find Match')).toBeInTheDocument();
  });

  it('navigates to dashboard when clicking Find Match', async () => {
    render(
      <MemoryRouter>
        <RoomsList />
      </MemoryRouter>
    );
    
    const createBtn = screen.getByText('Find Match');
    fireEvent.click(createBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
