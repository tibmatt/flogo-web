export function expectErrorResponse(promise) {
  return promise.catch(err => {
    if (err.response) {
      return Promise.resolve(err.response);
    }
    return Promise.reject(err);
  });
}
