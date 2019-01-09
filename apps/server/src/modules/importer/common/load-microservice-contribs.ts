export async function loadMicroserviceContribs(activitiesManager, triggersManager) {
  const [activities, triggers] = await Promise.all([
    activitiesManager.find(),
    triggersManager.find(),
  ]);
  return { activities, triggers };
}
