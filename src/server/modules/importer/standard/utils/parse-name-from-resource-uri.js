
export function parseNameFromResourceUri(resourceUri) {
  // flow refs have the structure res://flow:some-flow-id (https://github.com/TIBCOSoftware/flogo-contrib/tree/master/activity/subflow)
  return resourceUri.replace(/^\s*res:\/\/flow:/);
}
