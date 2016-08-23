package main

import (

	// activities
	_ "github.com/TIBCOSoftware/flogo-contrib/activity/wsmessage/runtime"
	_ "activity/tibco-app/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/activity/awsiot/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/activity/coap/runtime"
	_ "activity/tibco-counter/runtime"
	_ "activity/tibco-error/runtime"
	_ "activity/tibco-log/runtime"
	_ "activity/tibco-reply/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/activity/rest/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/activity/twilio/runtime"

	// triggers
	_ "github.com/TIBCOSoftware/flogo-contrib/trigger/coap/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/trigger/rest/runtime"
	_ "github.com/TIBCOSoftware/flogo-contrib/trigger/timer/runtime"

	// models
	_ "github.com/TIBCOSoftware/flogo-contrib/model/simple"

)
