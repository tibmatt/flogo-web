package main

var embeddedJSONFlows map[string]string

func init() {

	embeddedJSONFlows = make(map[string]string)


}

func EmeddedFlowsAreCompressed() bool {
	return true
}

func EmeddedJSONFlows() map[string]string {
	return embeddedJSONFlows
}
