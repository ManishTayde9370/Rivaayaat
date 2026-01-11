import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminCsvMappings from '../AdminCsvMappings';
import axios from 'axios';

jest.mock('axios');

describe('AdminCsvMappings', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { templates: [{ _id: 't1', name: 'Template 1', mapping: { colA: 'name' } }] } });
    axios.post.mockResolvedValue({ data: { success: true, template: { _id: 't2' } } });
    axios.put.mockResolvedValue({ data: { success: true, template: { _id: 't1' } } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => jest.clearAllMocks());

  it('loads and shows saved templates', async () => {
    render(<AdminCsvMappings />);
    // wait for the template to appear in the table
    expect(await screen.findByText('Template 1')).toBeTruthy();
  });

  it('creates a new template', async () => {
    render(<AdminCsvMappings />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const nameInput = screen.getByPlaceholderText('Template name');
    const textboxes = screen.getAllByRole('textbox');
    // textboxes[0] is the name input (also a textbox), textboxes[1] is the mapping textarea
    const mappingTextarea = textboxes[1];
    const saveButton = screen.getByText('Save Template');

    fireEvent.change(nameInput, { target: { value: 'New Template' } });
    fireEvent.change(mappingTextarea, { target: { value: '{"colA":"name"}' } });
    fireEvent.click(saveButton);

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/templates'), expect.objectContaining({ name: 'New Template', mapping: { colA: 'name' } }), expect.any(Object)));
  });

  it('edits an existing template', async () => {
    render(<AdminCsvMappings />);
    // wait for the Edit button to appear (ensures the table is rendered)
    const editBtn = await screen.findByText('Edit');
    fireEvent.click(editBtn);

    const updateButton = screen.getByText('Update Template');
    expect(screen.getByPlaceholderText('Template name').value).toBe('Template 1');

    fireEvent.change(screen.getByPlaceholderText('Template name'), { target: { value: 'Template 1 Updated' } });
    fireEvent.click(updateButton);

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  it('deletes a template', async () => {
    render(<AdminCsvMappings />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
  });

  it('copies mapping to clipboard', async () => {
    const writeMock = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeMock } });

    render(<AdminCsvMappings />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const copyBtn = screen.getByText('Copy');
    fireEvent.click(copyBtn);

    await waitFor(() => expect(writeMock).toHaveBeenCalled());
  });
});
