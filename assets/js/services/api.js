import { fetchWithRetry, handleErrors } from '../utils.js';

/**
 * @typedef {Object} Toy
 * @property {number|string} id
 * @property {string} name
 * @property {string} image
 * @property {boolean} enabled
 * @property {number} likes
 */

export const toyService = {
  /**
   * Fetch all toys
   * @param {string} endpoint 
   * @returns {Promise<Toy[]>}
   */
  async getAll(endpoint) {
    const response = await fetchWithRetry(`${endpoint}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleErrors(response);
  },

  /**
   * Create a new toy
   * @param {string} endpoint 
   * @param {Omit<Toy, 'id'>} toyData 
   * @returns {Promise<Toy>}
   */
  async create(endpoint, toyData) {
    const response = await fetchWithRetry(`${endpoint}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toyData),
    });
    return handleErrors(response);
  },

  /**
   * Update a toy
   * @param {string} endpoint
   * @param {number|string} id
   * @param {Omit<Toy, 'id'>} toyData
   * @returns {Promise<Toy>}
   */
  async update(endpoint, id, toyData) {
    const response = await fetchWithRetry(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toyData),
    });
    return handleErrors(response);
  },

  /**
   * Delete a toy
   * @param {string} endpoint 
   * @param {number|string} id 
   * @returns {Promise<void>}
   */
  async delete(endpoint, id) {
    const response = await fetchWithRetry(`${endpoint}/${id}`, {
      method: 'DELETE',
    });
    return handleErrors(response);
  },

  /**
   * Like a toy
   * @param {string} endpoint 
   * @param {number|string} id 
   * @param {number} likes 
   * @returns {Promise<Toy>}
   */
  async like(endpoint, id, likes) {
    const response = await fetchWithRetry(`${endpoint}/${id}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes }),
    });
    return handleErrors(response);
  }
};
