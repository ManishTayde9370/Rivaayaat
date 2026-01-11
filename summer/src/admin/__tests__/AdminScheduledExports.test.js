import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminScheduledExports from '../AdminScheduledExports';
import axios from 'axios';

jest.mock('axios');

describe('AdminScheduledExports', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { schedules: [{ _id: 's1', name: 'S1', cron: '0 0 * * *', destination: 'email' }] } });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  it('creates schedule with retry options', async () => {
    render(<AdminScheduledExports />);
    expect(await screen.findByText('S1')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'New S' } });
    fireEvent.change(screen.getByPlaceholderText('Cron (e.g. 0 0 * * *)'), { target: { value: '*/5 * * * *' } });
    fireEvent.click(screen.getByLabelText('Enable retry on failure'));
    fireEvent.change(screen.getByPlaceholderText('Max attempts (e.g. 3)'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('Backoff seconds (e.g. 60)'), { target: { value: '30' } });

    const createBtn = screen.getByText('Create Schedule');
    fireEvent.click(createBtn);

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/admin/exports'), expect.objectContaining({ name: 'New S', retry: { enabled: true, maxAttempts: 5, backoffSeconds: 30 } }), expect.any(Object)));
  });
  afterEach(() => jest.clearAllMocks());

  it('shows schedules and opens runs modal', async () => {
    render(<AdminScheduledExports />);
    expect(await screen.findByText('S1')).toBeTruthy();

    // mock runs fetch
    axios.get.mockResolvedValueOnce({ data: { runs: [{ _id: 'r1', status: 'failed', attempt: 1, errorMessage: 'oops' }] } });

    const viewBtn = screen.getByText('View runs');
    fireEvent.click(viewBtn);

    // expect runs table row
    expect(await screen.findByText('oops')).toBeTruthy();

    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/runs/r1/retry'), expect.any(Object), expect.any(Object)));
  });
});
