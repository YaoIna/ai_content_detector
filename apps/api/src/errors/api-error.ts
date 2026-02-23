export class ApiError extends Error {
  statusCode: number;
  code: string;
  payload?: unknown;

  constructor(statusCode: number, code: string, message: string, payload?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.payload = payload;
  }
}

export function mapError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      payload: error.payload ?? { error: error.code, message: error.message }
    };
  }

  return {
    statusCode: 500,
    payload: { error: 'INTERNAL_ERROR', message: 'Unexpected server error' }
  };
}
