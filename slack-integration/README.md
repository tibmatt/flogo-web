#  Flogo Slack Integration

##  PREREQUISITES
* NodeJS v5.0.0 or greater

### Configure your slack team

You need to create a *bot* slack integration and grab the API token it provides.

If you want to use the *slash command* features you need to expose this 
application's endpoints to the internet so they can be reachable by slack. Be sure to configure
your slash commands in slack to point to the url `https://<your-host>/slack/receive.
All commands are accessible in that endpoint.
 
For testing/trying purposes you can use [ngrok](http://ngrok.com) to allow access
from the internet to your local service, remember to enable HTTPS/SSL as it is required by slack.

## RUN

### Option 1: Set or pass slack api token

In terminal cd to slack-integration project root and execute:
```
SLACK_API_TOKEN=<YOUR-SLACK-TOKEN> node ./src/index.js
```

### Option 2: Use env file

Copy `.env.sample` file located in the root of the project and rename it to `.env`,
open the copied file and set the SLACK_API_TOKEN value with your api token.

In terminal cd to slack-integration project root and execute
```
SLACK_API_TOKEN=<YOUR-SLACK-TOKEN> node ./src/index.js
```

You can modify the other values in ´.env´ file if necessary. With this option
you avoid setting environment variables or passing them each time you run the app.

**Note:** Defined machine environment variables will override those of the .env file, this means
that if you have an enviroment variable with the same name as one in your .env file the one in the
file won't take effect.
