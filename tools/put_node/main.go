package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"
)

func main() {
	// Get command line arguments or use defaults
	nodeID := "node1"
	nodeIP := "192.168.1.100"
	nodeType := "gateway"
	nodeVersion := "1.0.0"
	location := "test-location"
	description := "Test node created by put_node tool"

	// Override with command line arguments if provided
	if len(os.Args) > 1 {
		nodeID = os.Args[1]
	}
	if len(os.Args) > 2 {
		nodeIP = os.Args[2]
	}
	if len(os.Args) > 3 {
		nodeType = os.Args[3]
	}
	if len(os.Args) > 4 {
		nodeVersion = os.Args[4]
	}
	if len(os.Args) > 5 {
		location = os.Args[5]
	}
	if len(os.Args) > 6 {
		description = os.Args[6]
	}

	// Get etcd endpoints from environment variable, default to localhost:2379
	endpoints := os.Getenv("ETCD_ENDPOINTS")
	if endpoints == "" {
		endpoints = "127.0.0.1:2379"
	}

	// Support multiple endpoints separated by comma
	endpointList := strings.Split(endpoints, ",")
	for i, endpoint := range endpointList {
		endpointList[i] = strings.TrimSpace(endpoint)
	}

	cli, err := clientv3.New(clientv3.Config{Endpoints: endpointList, DialTimeout: 5 * time.Second})
	if err != nil {
		panic(err)
	}
	defer cli.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Create comprehensive node data with all required fields
	nodeData := map[string]interface{}{
		"node_uuid":      nodeID,
		"ip":             nodeIP,
		"version":        nodeVersion,
		"registered_at":  time.Now().Unix(),
		"last_seen_time": time.Now().Unix(),
		"status":         "active",
		"node_type":      nodeType,
		"location":       location,
		"description":    description,
	}

	// Convert to JSON
	nodeJSON, err := json.Marshal(nodeData)
	if err != nil {
		panic(err)
	}

	etcdKey := fmt.Sprintf("nodes/%s", nodeID)
	_, err = cli.Put(ctx, etcdKey, string(nodeJSON))
	if err != nil {
		panic(err)
	}
	fmt.Printf("wrote %s with data: %s\n", etcdKey, string(nodeJSON))
}
