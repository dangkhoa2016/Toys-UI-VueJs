const isLocalDevelopmentHost = ['127.0.0.1', 'localhost'].includes(window.location.hostname);

export const TOY_API_URL =
  window.TOY_API_URL ||
  (isLocalDevelopmentHost
    ? 'http://localhost:8080/api/toys'
    : 'https://toy-api-server-cloudflare-worker.dangkhoa.dev/api/toys');

export const DEMO_DATA_PATH = '/assets/db.json';

export const TOY_FORM_FIELD_NAMES = Object.freeze({
  NAME: 'name',
  IMAGE: 'image',
});

export const TOY_FORM_EDITABLE_FIELDS = Object.freeze([
  TOY_FORM_FIELD_NAMES.NAME,
  TOY_FORM_FIELD_NAMES.IMAGE,
]);

export const TOY_SORT_ORDERS = Object.freeze({
  DEFAULT: 'default',
  LIKES_DESC: 'likes-desc',
  LIKES_ASC: 'likes-asc',
});

export const TOY_SORT_ORDER_VALUES = Object.freeze([
  TOY_SORT_ORDERS.DEFAULT,
  TOY_SORT_ORDERS.LIKES_DESC,
  TOY_SORT_ORDERS.LIKES_ASC,
]);

export const TOY_PREVIEW_STATUS = Object.freeze({
  IDLE: 'idle',
  PENDING: 'pending',
  READY: 'ready',
  ERROR: 'error',
});

export const TOY_TOAST_VARIANTS = Object.freeze({
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
});

export const TOY_VALIDATION_LIMITS = Object.freeze({
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 120,
});

export const TOY_FORM_TIMINGS = Object.freeze({
  IMAGE_PREVIEW_DEBOUNCE_MS: 300,
});

export const TOY_ALLOWED_IMAGE_PROTOCOLS = Object.freeze(['http:', 'https:']);

export const TOY_UI_LIMITS = Object.freeze({
  SCROLL_TOP_VISIBLE_OFFSET_PX: 300,
});

export const TOY_UI_DELAYS = Object.freeze({
  HIGHLIGHT_RESET_MS: 700,
});

export const TOY_TOAST_SETTINGS = Object.freeze({
  DEFAULT_DELAY_MS: 5000,
  ERROR_DELAY_MS: 3600,
  DEFAULT_TITLE: 'Toy Tale',
});

export const TOY_TEMPLATE_SETTINGS = Object.freeze({
  SKELETON_CARD_COUNT: 4,
});

export const TOY_NETWORK_SETTINGS = Object.freeze({
  RETRY_COUNT: 3,
  BACKOFF_MS: 500,
  TIMEOUT_MS: 5000,
});

export const config = {
  API_ENDPOINT: TOY_API_URL,
  RETRY_COUNT: TOY_NETWORK_SETTINGS.RETRY_COUNT,
  BACKOFF_MS: TOY_NETWORK_SETTINGS.BACKOFF_MS,
  TIMEOUT_MS: TOY_NETWORK_SETTINGS.TIMEOUT_MS,
};

export const TOY_IMAGE_DIRECTORY = '/assets/images/toys/';

const REMOTE_IMAGE_PATTERN = /^(?:https?:)?\/\//i;
const TOY_IMAGE_PREFIX_PATTERN =
  /^(?:\/?assets\/images\/toys\/|\/?images\/toys\/|\/?toys\/|\/?imgs\/)+/i;

export function normalizeToyImageUrl(image) {
  if (typeof image !== 'string') {
    return '';
  }

  const trimmedImage = image.trim();

  if (!trimmedImage) {
    return '';
  }

  if (
    REMOTE_IMAGE_PATTERN.test(trimmedImage) ||
    trimmedImage.startsWith(TOY_IMAGE_DIRECTORY) ||
    trimmedImage.startsWith('/assets/')
  ) {
    return trimmedImage;
  }

  const normalizedRelativePath = trimmedImage
    .replace(/^\/+/, '')
    .replace(TOY_IMAGE_PREFIX_PATTERN, '');

  if (!normalizedRelativePath) {
    return TOY_IMAGE_DIRECTORY;
  }

  return `${TOY_IMAGE_DIRECTORY}${normalizedRelativePath}`;
}

export function toApiImageUrl(image) {
  const normalizedImage = normalizeToyImageUrl(image);

  if (!normalizedImage || REMOTE_IMAGE_PATTERN.test(normalizedImage)) {
    return normalizedImage;
  }

  return new URL(normalizedImage, window.location.origin).href;
}

export function normalizeToy(toy) {
  const likes = Number.parseInt(toy?.likes ?? 0, 10);

  return {
    ...toy,
    name: String(toy?.name ?? '').trim(),
    image: normalizeToyImageUrl(toy?.image),
    likes: Number.isFinite(likes) ? Math.max(likes, 0) : 0,
  };
}
