import React from 'react';
import { act, render, waitForElement } from '@testing-library/react';

import App from './App';
import * as dataService from './dataService';

jest.mock('./dataService');

describe('App tests', () => {
  it('Triggers fetch on mount', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(dataService.fetchData).toHaveBeenCalledTimes(1);
  });

  it('Shows loading during data fetch', async () => {
    const message = 'Groovy!';
    let dataResolve = undefined;

    dataService.fetchData.mockImplementationOnce(() => new Promise(resolve => {
      dataResolve = resolve;
    }));

    const { getByRole, getByText, queryByRole } = render(<App />);
    const loadingElement = await waitForElement(() => getByRole('status'));
    expect(loadingElement).toHaveClass('loading');

    dataResolve({ message });
    await waitForElement(() => getByText(message));
    expect(queryByRole('status')).toBeNull();
  });

  it('Shows data when fetch is successful', async () => {
    const message = 'Get in!';
    dataService.fetchData.mockResolvedValueOnce({ message });

    const { getByText } = render(<App />);

    await waitForElement(() => getByText(message));
  });

  it('Shows error message when data fetch fails', async () => {
    dataService.fetchData.mockRejectedValueOnce(new Error('Boom!'));

    const { getByRole } = render(<App />);

    const errorElement = await waitForElement(() => getByRole('alert'));
    expect(errorElement).toHaveClass('error');
  });
});
