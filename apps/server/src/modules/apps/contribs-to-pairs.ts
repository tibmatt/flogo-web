import { ContributionSchema } from '@flogo-web/core';

const toPairs = c => [c.ref, c] as [string, any];

export async function contribsToPairs(
  contribPromise: Promise<Array<ContributionSchema>>
) {
  const contribs = await contribPromise;
  return contribs.map(toPairs);
}
