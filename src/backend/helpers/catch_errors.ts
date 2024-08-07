
export const checkForErrors = async <T>(
  func: () => Promise<T>
): Promise<[T, undefined] | [undefined, string]> => {
  try {
    const result = await func();
    return [result, undefined];
  } catch (e) {
    const errorString = String(e);
    return [undefined, errorString.length ? errorString : "Error"];
  }
};
