export function extractContribRefs(contributions) {
  return contributions.map(contribution => contribution.ref);
}
