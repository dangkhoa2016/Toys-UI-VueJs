import { normalizeToy } from './config/config.js';

export function createHighlightedToyState({ id = null, nonce = 0 } = {}) {
  return {
    id: id ? String(id) : null,
    nonce,
  };
}

export function createToyStoreState() {
  return {
    createToyModalOpen: false,
    editingToyId: null,
    searchTerm: '',
    sortOrder: 'default',
    toasts: [],
    highlightedToy: createHighlightedToyState(),
    toys: [],
    toy: null,
    isLoadingToys: null,
    totalToys: null,
    loadToysError: null,
    createToyResult: null,
    createToyError: null,
    isCreatingToy: null,
    updateToyResult: null,
    updateToyError: null,
    updatingToyId: null,
    deleteToyError: null,
    isDeletingToy: null,
    deleteToyResult: null,
    confirmDeleteToyId: null,
  };
}

export function normalizeSortOrder(payload) {
  return ['default', 'likes-desc', 'likes-asc'].includes(payload) ? payload : 'default';
}

export function setSearchTerm(state, payload) {
  state.searchTerm = payload || '';
}

export function setSortOrder(state, payload) {
  state.sortOrder = normalizeSortOrder(payload);
}

export function setHighlightedToyState(state, payload) {
  state.highlightedToy = createHighlightedToyState(payload);
  return state.highlightedToy;
}

export function flashToyState(state, toyId, { nonce = Date.now() } = {}) {
  return setHighlightedToyState(state, {
    id: toyId,
    nonce,
  });
}

export function clearHighlightedToyState(state) {
  return setHighlightedToyState(state);
}

export function getHighlightedToySignature(state) {
  const highlightedToy = state?.highlightedToy || createHighlightedToyState();
  return `${highlightedToy.id || ''}:${highlightedToy.nonce || 0}`;
}

export function syncToyState(state, toys) {
  state.toys = Array.isArray(toys) ? toys.map((toy) => normalizeToy(toy)) : [];
  state.totalToys = state.toys.length;
}

export function prependToyState(state, payload) {
  const normalizedPayload = normalizeToy(payload);
  state.toys = [normalizedPayload, ...state.toys.filter((toy) => toy.id.toString() !== normalizedPayload.id.toString())];
  state.totalToys = state.toys.length;
}

export function updateToyState(state, payload) {
  const normalizedPayload = normalizeToy(payload);
  const toys = [...state.toys];
  const id = normalizedPayload.id.toString();
  const indx = toys.findIndex((toy) => toy.id.toString() === id);

  if (indx !== -1)
    toys[indx] = { ...toys[indx], ...normalizedPayload };
  else
    toys.push(normalizedPayload);

  state.toys = toys;
  state.totalToys = state.toys.length;
}

export function removeToyState(state, toyId) {
  const normalizedId = toyId ? toyId.toString() : (state.confirmDeleteToyId || '').toString();
  if (!normalizedId) {
    return;
  }

  const indx = state.toys.findIndex((toy) => toy.id.toString() === normalizedId);
  if (indx < 0) {
    return;
  }

  state.toys.splice(indx, 1);
  state.totalToys = state.toys.length;
  state.confirmDeleteToyId = '';
}

export function getVisibleToys(state) {
  const toys = Array.isArray(state.toys) ? [...state.toys] : [];
  const normalizedSearchTerm = (state.searchTerm || '').trim().toLowerCase();
  const filteredToys = normalizedSearchTerm
    ? toys.filter((toy) => (toy.name || '').toLowerCase().includes(normalizedSearchTerm))
    : toys;

  if (state.sortOrder === 'likes-desc') {
    return filteredToys.sort((left, right) => right.likes - left.likes || left.name.localeCompare(right.name));
  }

  if (state.sortOrder === 'likes-asc') {
    return filteredToys.sort((left, right) => left.likes - right.likes || left.name.localeCompare(right.name));
  }

  return filteredToys;
}

export function createToastPayload(payload) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: payload && payload.title ? payload.title : 'Toy Tale',
    message: payload && payload.message ? payload.message : '',
    variant: payload && payload.variant ? payload.variant : 'primary',
    delay: payload && payload.delay ? payload.delay : 5000,
  };
}

export function addToastState(state, payload) {
  const toast = createToastPayload(payload);
  state.toasts = [...state.toasts, toast];
  return toast;
}

export function removeToastState(state, payload) {
  state.toasts = state.toasts.filter((toast) => toast.id !== payload);
}

export function getToastMessage(error, fallbackMessage) {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  return fallbackMessage;
}
