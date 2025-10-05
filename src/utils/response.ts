class ApiError extends Error {
  statusCode: number;
  message: string;
  data: null;
  error: any[];
  success: boolean;
  constructor(
    statusCode: number,
    message: string = "Something went wrong 🔴",
    error: any[],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = null;
    this.error = error;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ApiSuccess {
  statusCode: number;
  message: string;
  data: any;
  success: boolean;
  constructor(
    statusCode: number,
    message: string = "Request successful 🟢",
    data: any
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiError, ApiSuccess };
