export function getApiErrorMessage(err: unknown) {
  if ((err as { message: string }).message) {
    return (err as { message: string }).message;
  } else {
    return "an unexpected error occured";
  }
}
