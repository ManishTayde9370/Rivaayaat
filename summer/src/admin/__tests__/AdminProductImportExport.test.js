import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminProductImportExport from '../AdminProductImportExport';
import axios from 'axios';

jest.mock('axios');

describe('AdminProductImportExport', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { templates: [{ _id: 't1', name: 'T1', mapping: { 'name': 'name', 'price': 'price' } }] } });
  });

  it('shows preview modal after preview call and proceeds with import', async () => {
    // Mock preview response with an error row
    axios.post.mockImplementation((url) => {
      if (url.endsWith('/api/admin/csv/preview')) {
        return Promise.resolve({ data: { success: true, preview: [
          { line: 2, productData: { name: 'A', price: '10' }, errors: [] },
          { line: 3, productData: { name: 'B', price: 'not-a-number' }, errors: [{ code: 'invalid_price', message: 'price must be a number' }] }
        ], errors: [{ line: 3, errors: [{ code: 'invalid_price', message: 'price must be a number' }] }] } });
      }
      if (url.endsWith('/api/admin/products/import-csv')) {
        return Promise.resolve({ data: { created: 1, updated: 0 } });
      }
      return Promise.resolve({ data: {} });
    });

    const { container } = render(<AdminProductImportExport />);

    // Wait for templates to load
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Attach a file
    const file = new File(["name,price\nA,10"], 'test.csv', { type: 'text/csv' });
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    // Select template
    const select = container.querySelector('select');
    fireEvent.change(select, { target: { value: 't1' } });

    // Click upload - should call preview and open modal
    fireEvent.click(screen.getByText('Upload CSV'));

    await waitFor(() => screen.getByText(/CSV Preview/i));

    // use a stable assertion that works even if jest-dom isn't configured
    expect(screen.queryByText('CSV Preview')).not.toBeNull();

    // validate filter buttons and error display
    const errorsBtn = screen.getByRole('button', { name: 'Errors' });
    expect(errorsBtn).toBeInTheDocument();
    fireEvent.click(errorsBtn);
    // Should only show the error row
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('A')).toBeNull();

    // Click proceed to import
    fireEvent.click(screen.getByText('Proceed with Import'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/admin/products/import-csv'), expect.any(FormData), expect.any(Object)));
  });
});
