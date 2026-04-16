/*jshint esversion: 9 */

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500, timeout = 5000) {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);

      // We don't throw here for non-ok responses if we want handleErrors to process them
      // But we should throw on network errors or timeouts to trigger retry
      return res;
    } catch (err) {
      clearTimeout(id);
      if (i === retries - 1) throw err;
      await sleep(backoff * (i + 1));
    }
  }
}

/**
 * Standardize API error handling
 * @param {Response} response 
 * @returns {Promise<any>}
 */
export async function handleErrors(response) {
  const contentType = response.headers.get('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType.includes('image/')) {
    data = { url: response.url };
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`, data);
    
    // Custom error messages based on status
    if (response.status === 422) {
      return { status: response.status, error: 'Missing required field or invalid data.', details: data };
    }
    
    if (typeof data === 'object' && data !== null) {
      return { status: response.status, ...data };
    }
    
    return { status: response.status, error: data || response.statusText };
  }

  return data;
}
