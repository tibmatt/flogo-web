package main

import (
    "fmt"
    "runtime"
);

func main() {
    fmt.Printf("%s_%s", runtime.GOOS, runtime.GOARCH)
}
