echoInfo "stop flogo-web and pouchdb"
lsof -i:3010 | grep node | awk '{print $2}' | xargs kill -9
lsof -i:5984 | grep node | awk '{print $2}' | xargs kill -9

echoInfo "stop slack bot"
lsof -i:5050 | grep node | awk '{print $2}' | xargs kill -9
