package main

import (
	"github.com/TIBCOSoftware/flogo-lib/engine"
	"github.com/TIBCOSoftware/flogo-lib/service/flowprovider/ppsremote"
	"github.com/TIBCOSoftware/flogo-lib/service/staterecorder/srsremote"
	"github.com/TIBCOSoftware/flogo-lib/service/tester"
)

// GetEngineEnvironment gets the engine environment
func GetEngineEnvironment(engineConfig *engine.Config, triggersConfig *engine.TriggersConfig) *engine.Environment {

	flowProvider := ppsremote.NewRemoteFlowProvider()
	stateRecorder := srsremote.NewRemoteStateRecorder()
	engineTester := tester.NewRestEngineTester()

	env := engine.NewEnvironment(flowProvider, stateRecorder, engineTester, engineConfig, triggersConfig)
	env.SetEmbeddedJSONFlows(EmeddedFlowsAreCompressed(), EmeddedJSONFlows())

	return env
}
