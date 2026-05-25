export interface FormatSlackError {
  filePath: string;
  lineNumber: number;
  methodName: string;
  stackTrace: string;
  status: string;
  errorMessage: string;
}
