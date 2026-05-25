export const formatError = (error) => {
  const originalError = error.extensions?.originalError as Error | undefined;

  if (!originalError) {
    const errorData = {
      message: Array.isArray(error.message) ? error.message[0] : error.message,
      code: error.extensions?.code,
      timestamp: new Date().toISOString(),
      path: error?.path,
    };

    // TODO: Log errorData to a logging service
    return errorData;
  }

  return {
    message: Array.isArray(originalError.message)
      ? originalError.message[0]
      : originalError.message,
    code: error.extensions?.code,
    timestamp: new Date().toISOString(),
    path: error?.path,
  };
};
