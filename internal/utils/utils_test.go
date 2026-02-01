package utils

import (
	"net"
	"testing"
)

func TestParseIPRange(t *testing.T) {
	tests := []struct {
		name        string
		ipRange     string
		wantStartIP string
		wantEndIP   string
		wantErr     bool
	}{
		{
			name:        "valid IP range with spaces",
			ipRange:     "192.168.3.2 - 192.168.3.4",
			wantStartIP: "192.168.3.2",
			wantEndIP:   "192.168.3.4",
			wantErr:     false,
		},
		{
			name:        "valid IP range without spaces",
			ipRange:     "192.168.1.1-192.168.1.254",
			wantStartIP: "192.168.1.1",
			wantEndIP:   "192.168.1.254",
			wantErr:     false,
		},
		{
			name:        "valid IP range with extra spaces",
			ipRange:     "  10.0.0.1  -  10.0.0.100  ",
			wantStartIP: "10.0.0.1",
			wantEndIP:   "10.0.0.100",
			wantErr:     false,
		},
		{
			name:        "invalid format - no dash",
			ipRange:     "192.168.1.1 192.168.1.10",
			wantStartIP: "",
			wantEndIP:   "",
			wantErr:     true,
		},
		{
			name:        "invalid format - multiple dashes",
			ipRange:     "192.168.1.1-192.168.1.10-192.168.1.20",
			wantStartIP: "",
			wantEndIP:   "",
			wantErr:     true,
		},
		{
			name:        "empty string",
			ipRange:     "",
			wantStartIP: "",
			wantEndIP:   "",
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			startIP, endIP, err := ParseIPRange(tt.ipRange)

			if (err != nil) != tt.wantErr {
				t.Errorf("ParseIPRange() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if startIP.String() != tt.wantStartIP {
					t.Errorf("ParseIPRange() startIP = %v, want %v", startIP.String(), tt.wantStartIP)
				}
				if endIP.String() != tt.wantEndIP {
					t.Errorf("ParseIPRange() endIP = %v, want %v", endIP.String(), tt.wantEndIP)
				}
			}
		})
	}
}

func TestIPv4toInt(t *testing.T) {
	tests := []struct {
		name    string
		ip      string
		want    uint32
		wantErr bool
	}{
		{
			name:    "valid IPv4 - 192.168.1.1",
			ip:      "192.168.1.1",
			want:    3232235777, // 192*256^3 + 168*256^2 + 1*256 + 1
			wantErr: false,
		},
		{
			name:    "valid IPv4 - 10.0.0.1",
			ip:      "10.0.0.1",
			want:    167772161, // 10*256^3 + 0*256^2 + 0*256 + 1
			wantErr: false,
		},
		{
			name:    "valid IPv4 - 0.0.0.0",
			ip:      "0.0.0.0",
			want:    0,
			wantErr: false,
		},
		{
			name:    "valid IPv4 - 255.255.255.255",
			ip:      "255.255.255.255",
			want:    4294967295,
			wantErr: false,
		},
		{
			name:    "IPv6 address",
			ip:      "2001:db8::1",
			want:    0,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ip := net.ParseIP(tt.ip)
			got, err := IPv4toInt(ip)

			if (err != nil) != tt.wantErr {
				t.Errorf("IPv4toInt() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr && got != tt.want {
				t.Errorf("IPv4toInt() = %v, want %v", got, tt.want)
			}
		})
	}
}
