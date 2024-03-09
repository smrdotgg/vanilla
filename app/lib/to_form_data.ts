// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toFormData<T extends Record<string, any>>(obj: T): FormData {
  return Object.entries(obj).reduce((formData, [key, value]) => {
    formData.append(key, value);
    return formData;
  }, new FormData());
}

