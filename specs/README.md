To run you have to have flogo-web environment already started, that is flogo-web application and state and flow services.

Then in a terminal execute

```
npm run e2e
```
 
to run the tests locally.

# Run in a docker container

In a terminal run (this is only needed the first time):

```
docker pull hortonworks/docker-e2e-protractor
```

Go to the flogo-web project directory and run 
```
npm run e2e-container
```
