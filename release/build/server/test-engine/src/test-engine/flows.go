package main

import (
	"github.com/TIBCOSoftware/flogo-lib/core/action"
	"github.com/TIBCOSoftware/flogo-lib/engine"
	"github.com/TIBCOSoftware/flogo-lib/flow/flowinst"
	"github.com/TIBCOSoftware/flogo-lib/flow/service"
	"github.com/TIBCOSoftware/flogo-lib/flow/service/flowprovider"
	"github.com/TIBCOSoftware/flogo-lib/flow/service/staterecorder"
	"github.com/TIBCOSoftware/flogo-lib/flow/service/tester"
	"github.com/TIBCOSoftware/flogo-lib/flow/support"
)

var embeddedJSONFlows map[string]string

func init() {

	embeddedJSONFlows = make(map[string]string)


}

// EnableFlowServices enables flow services and action for engine
func EnableFlowServices(engine *engine.Engine, engineConfig *engine.Config) {

	log.Debug("Flow Services and Actions enabled")

	embeddedFlowMgr := support.NewEmbeddedFlowManager(true, embeddedJSONFlows)

	fpConfig := engineConfig.Services[service.ServiceFlowProvider]
	flowProvider := flowprovider.NewRemoteFlowProvider(fpConfig, embeddedFlowMgr)
	engine.RegisterService(flowProvider)

	srConfig := engineConfig.Services[service.ServiceStateRecorder]
	stateRecorder := staterecorder.NewRemoteStateRecorder(srConfig)
	engine.RegisterService(stateRecorder)

	etConfig := engineConfig.Services[service.ServiceEngineTester]
	engineTester := tester.NewRestEngineTester(etConfig)
	engine.RegisterService(engineTester)

	options := &flowinst.ActionOptions{Record: stateRecorder.Enabled()}

	flowAction := flowinst.NewFlowAction(flowProvider, stateRecorder, options)
	action.Register(flowinst.ActionType, flowAction)
}
