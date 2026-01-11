import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CsvPreviewModal from '../CsvPreviewModal';

const preview = [
  { line: 2, productData: { name: 'A', price: '10' }, errors: [] },
  { line: 3, productData: { name: 'B', price: 'bad' }, errors: [{ code: 'invalid_price', message: 'price must be a number' }] }
];

describe('CsvPreviewModal', () => {
  it('filters errors and allows download', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<CsvPreviewModal isOpen={true} preview={preview} errors={[{line:3, errors: [{code:'invalid_price', message:'price must be a number'}]}]} onClose={onClose} onConfirm={onConfirm} />);

    expect(screen.getByText('CSV Preview')).toBeInTheDocument();
    // filter to errors (button)
    const errorsBtn = screen.getByRole('button', { name: 'Errors' });
    fireEvent.click(errorsBtn);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('A')).toBeNull();

    // mock download by providing createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:fake');
    fireEvent.click(screen.getByText('Download Preview CSV'));
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
