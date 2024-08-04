export function objToFormData(obj: { [key: string]: any }): FormData {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object") {
      formData.append(key, JSON.stringify(obj[key]));
    } else {
      formData.append(key, obj[key]);
    }
  });
  return formData;
}
export function formDataToObj(formData: FormData): { [key: string]: any } {
  const obj: { [key: string]: any } = {};
  formData.forEach((value, key) => {
    try {
      obj[key] = JSON.parse(value as any);
    } catch (e) {
      obj[key] = value;
    }
  });
  return obj;
}
