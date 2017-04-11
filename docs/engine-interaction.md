# Engine interaction

## When the engine project doesn't exist

1. Run `flogo create` (In the release build we also add the `-flv` flag, ex. `flogo create -flv v0.3.2`)
2. Run `flogo add palette -v 0.3.2  default-palette.json` (default-palette references all the triggers and activities in the contrib repo)

## Everytime the app starts

1. Create config.json based on the server app's config and a triggers.json file and place them into `<engine>/bin-test`.
The triggers.json file contents are only: `{ "triggers": [] }`
2. Run `flogo build` from inside the `<engine>/bin-test` directory
3. Start the compiled binary under `<engine>/bin-test` directory
4. Read "flogo.json" under the engine project root to list all the installed activities and triggers
5. Based on the "flogo.json" info and for every installed activity and trigger read its corresponding activity.json/trigger.json under "vendor" directory and load
the definitions into the server UI database


## Activity/trigger installation once the engine is created

1. If activity/trigger is already installed run `flogo del activity <activity-pkg>` or `flogo del trigger <trigger-pkg>`
2. Run `flogo add activity <activity-pkg>` or `flogo add activity <trigger-pkg>`
3. Run `flogo build` from inside the `<engine>/bin-test` directory
4. Stop previous engine process instance, start the new generated binary


## When you want to get the binary for a flow
1. Output a flow.json file (it is using the "old" flow.json structure with activityType instead of activityRef). The file is always named "flow.json" so it can be referenced from the trigger data.
2. Run `flogo add flow file://<path to the generated flow.json>`
3. Create config.json based on the server app's config (right now it is the same config used when test run a flow) and place it into `<engine>/bin`
4. Create a triggers.json file with the trigger info of the flow that is being built (trigger settings, endpoint settings, etc.). Also, we hardcode an "actionURI" property
 with the value "embedded://flow" in the "endpoint" data. The generated triggers.json is placed in the `<engine>/bin` directory.
5. Run `flogo build -o -i` (also GOOS and GOARCH env vars are set depending on what the user selected in the UI)
6. Generated binary is sent to the user