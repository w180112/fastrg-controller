package main

import (
	"context"
	"flag"
	"time"

	controllerpb "fastrg-controller/proto"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// 定義命令行參數
	grpcAddr := flag.String("addr", "localhost:50051", "gRPC server address")
	flag.Parse()

	// 連接到 gRPC 伺服器
	conn, err := grpc.Dial(*grpcAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logrus.WithError(err).Fatal("failed to connect to gRPC server")
	}
	defer conn.Close()

	client := controllerpb.NewNodeManagementClient(conn)

	// 測試節點註冊
	registerReq := &controllerpb.NodeRegisterRequest{
		NodeUuid: "test-node-001",
		Ip:       "192.168.1.100",
		Version:  "1.0.0",
	}

	logrus.Infof("Registering node: %+v", registerReq)
	registerResp, err := client.RegisterNode(context.Background(), registerReq)
	if err != nil {
		logrus.WithError(err).Fatal("RegisterNode failed")
	}
	logrus.Infof("Register response: %+v", registerResp)

	// Test sending heartbeat
	heartbeatReq := &controllerpb.NodeHeartbeat{
		NodeUuid:        "test-node-001",
		UptimeTimestamp: time.Now().Unix(),
		Ip:              "192.168.1.100",
	}

	logrus.Infof("Sending heartbeat: %+v", heartbeatReq)
	_, err = client.Heartbeat(context.Background(), heartbeatReq)
	if err != nil {
		logrus.WithError(err).Fatal("Heartbeat failed")
	}
	logrus.Infof("Heartbeat sent successfully")

	// Test sending second heartbeat
	time.Sleep(2 * time.Second)
	heartbeatReq.UptimeTimestamp = time.Now().Unix()

	logrus.Infof("Sending second heartbeat: %+v", heartbeatReq)
	_, err = client.Heartbeat(context.Background(), heartbeatReq)
	if err != nil {
		logrus.WithError(err).Fatal("Second heartbeat failed")
	}
	logrus.Infof("Second heartbeat sent successfully")
}
