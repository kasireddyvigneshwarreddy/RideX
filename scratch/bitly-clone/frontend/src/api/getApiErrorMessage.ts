import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'Cannot connect to the server. Please make sure the backend is running.';
  }

  const responseData: unknown = error.response.data;
  if (responseData && typeof responseData === 'object') {
    if ('message' in responseData && typeof responseData.message === 'string') {
      return responseData.message;
    }

    const messages = Object.entries(responseData)
      .filter(([key, value]) => key !== 'error' && typeof value === 'string')
      .map(([, value]) => value);
    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  return fallback;
};
