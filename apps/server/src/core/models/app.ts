export function constructApp(inputData, generateId?: () => string) {
  const now = new Date().toISOString();
  return {
    ...inputData,
    _id: inputData._id || generateId(),
    name: inputData.name.trim(),
    createdAt: now,
    updatedAt: null,
    triggers: [],
    actions: [],
  };
}
