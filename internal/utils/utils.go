package utils

import (
	"encoding/binary"
	"errors"
	"fmt"
	"net"
	"strings"
)

func ParseIPRange(ipRange string) (net.IP, net.IP, error) {
	// 去除空白
	ipRange = strings.TrimSpace(ipRange)
	parts := strings.Split(ipRange, "-")
	if len(parts) != 2 {
		return nil, nil, fmt.Errorf("invalid IP range format: %s", ipRange)
	}
	startIP := strings.TrimSpace(parts[0])
	endIP := strings.TrimSpace(parts[1])
	return net.ParseIP(startIP), net.ParseIP(endIP), nil
}

func IPv4toInt(ip net.IP) (uint32, error) {
	ipv4Bytes := ip.To4()
	if ipv4Bytes == nil {
		return 0, errors.New("not a valid IPv4 address")
	}
	return binary.BigEndian.Uint32(ipv4Bytes), nil
}
