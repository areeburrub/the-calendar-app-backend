export class ApiError extends Error {
  public statusCode: number;
  public message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static unauthorized(message: string = "Unauthorized Access") {
    return new ApiError(401, message);
  }

  static notFound(message: string = "Resource not found") {
    return new ApiError(404, message);
  }

  static badRequest(message: string = "Bad request") {
    return new ApiError(400, message);
  }

  static conflict(message: string = "Conflict with existing resource") {
    return new ApiError(409, message);
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(500, message);
  }
}
