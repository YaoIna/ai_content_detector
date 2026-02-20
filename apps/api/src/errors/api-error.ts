export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function mapError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      payload: { error: error.code, message: error.message }
    };
  }

  return {
    statusCode: 500,
    payload: { error: 'INTERNAL_ERROR', message: 'Unexpected server error' }
  };
}
