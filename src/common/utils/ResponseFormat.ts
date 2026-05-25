import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

export class ResponseFormat {
  /**
   * Sends a success JSON response to the client with data.
   * @param res - Express Response object
   * @param message - Success message
   * @param code - HTTP status code (default: 200)
   * @param data - Response payload
   */
  static success<T>(
    res: Response,
    message: string,
    data: T,
    code: HttpStatus = HttpStatus.OK,
  ): void {
    this.send(res, true, code, message, data);
  }

  /**
   * Sends a basic success JSON response to the client without data.
   * @param res - Express Response object
   * @param message - Success message
   * @param code - HTTP status code (default: 200)
   */
  static ok(
    res: Response,
    message: string,
    code: HttpStatus = HttpStatus.OK,
  ): void {
    res.status(code).json({
      success: true,
      message,
    });
  }

  /**
   * Sends a failure JSON response to the client.
   * @param res - Express Response object
   * @param message - Error message
   * @param data - Error details or additional information
   * @param code - HTTP status code (default: 400)
   */
  static failure<T>(
    res: Response,
    message: string,
    code: HttpStatus = HttpStatus.BAD_REQUEST,
    data?: T,
  ): void {
    this.send(res, false, code, message, data);
  }

  /**
   * Generic method to send JSON responses to the client.
   * @param res - Express Response object
   * @param responseCode - Response code metadata
   * @param code - HTTP status code (default: 200)
   * @param message - Custom message (falls back to default response message)
   * @param data - Response payload
   */
  private static send<T>(
    res: Response,
    responseCode: boolean,
    code: HttpStatus = HttpStatus.OK,
    message: string,
    data: T,
  ): void {
    res.status(code).json({
      success: responseCode,
      message,
      data: data || undefined,
    });
  }
}
