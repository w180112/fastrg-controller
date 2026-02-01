# FastRG Controller Kubernetes Deployment

This directory contains Kubernetes deployment configurations for FastRG Controller, including native YAML files and Helm Charts.

## Directory Structure

```
deployment/
├── k8s/                          # Native Kubernetes YAML files
│   ├── deploy.sh                 # Deployment script for quick start
│   ├── undeploy.sh               # Undeployment script for quick cleanup
│   ├── etcd-external.yml         # external etcd deployment
│   ├── etcd-internal.yml         # internal etcd deployment
│   ├── ingress.yml               # LoadBalancer Service configuration
│   └── fastrg_controller.yml     # FastRG Controller deployment configuration
└── helm/                         # Helm Chart
    └── fastrg-controller/
        ├── Chart.yaml            # Chart metadata
        ├── values.yaml           # Default configuration values
        └── templates/            # Kubernetes resource templates
            ├── _helpers.tpl      # Helm helper functions
            ├── namespace.yaml    # Namespace definition
            ├── etcd.yaml         # etcd resources
            ├── controller.yaml   # Controller resources
            ├── rbac.yaml         # RBAC configuration
            └── extras.yaml       # PDB and HPA
```

## Quick Start

### Option 1: Using Native Kubernetes YAML

```bash
# Use the deploy script for quick deployment, this will deploy Cilium CNI as well
# Use deploy.sh --help to see available options
cd deployment/k8s
chmod +x deploy.sh
./deploy.sh

# or

# 1. Deploy external etcd or internal etcd
kubectl apply -f deployment/k8s/etcd-external.yml
or
kubectl apply -f deployment/k8s/etcd-internal.yml

# 2. Wait for etcd to be ready
kubectl wait --for=condition=available --timeout=300s deployment/etcd -n fastrg-system

# 3. Deploy FastRG Controller
kubectl apply -f deployment/k8s/fastrg_controller.yml

# 4. Check deployment status
kubectl get pods -n fastrg-system
kubectl get services -n fastrg-system
```

### Option 2: Using Helm Chart (Recommended)

```bash
# 1. Install Helm Chart
helm install fastrg-controller deployment/helm/fastrg-controller/

# 2. Check deployment status
kubectl get pods -n fastrg-system
helm status fastrg-controller

# 3. Get service information
kubectl get services -n fastrg-system
```

## Configuration

### Environment Variables

| Variable Name | Description | Default Value |
|---------------|-------------|---------------|
| `ETCD_ENDPOINTS` | etcd service endpoints | `etcd-service:2379` |
| `GRPC_PORT` | gRPC service port | `50051` |
| `HTTP_REDIRECT_PORT` | HTTP redirect port | `8080` |
| `HTTPS_PORT` | HTTPS service port | `8443` |
| `GIN_MODE` | Gin mode | `release` |

### Service Ports

| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| gRPC | 50051 | TCP | gRPC API |
| HTTP | 8080 | TCP | HTTP redirect |
| HTTPS | 8443 | TCP | Web interface and REST API |
| etcd Client | 2379 | TCP | etcd client connection |
| etcd Peer | 2380 | TCP | etcd cluster communication |

## Helm Chart Custom Configuration

### Basic Configuration Example

```yaml
# custom-values.yaml
controller:
  replicaCount: 3
  
  service:
    type: ClusterIP
    
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

etcd:
  persistence:
    size: 20Gi
```

```bash
helm install fastrg-controller deployment/helm/fastrg-controller/ -f custom-values.yaml
```

### Production Environment Configuration

```yaml
# production-values.yaml
global:
  namespace: fastrg-system
  storageClass: "fast-ssd"

controller:
  replicaCount: 3
  service:
    type: LoadBalancer
  
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

podDisruptionBudget:
  enabled: true
  minAvailable: 2

monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
```

## SSL Certificate Management

### Auto-generated Certificates (Default)

The chart automatically generates self-signed certificates in the init container by default.

### Using Existing Certificates

```yaml
controller:
  tls:
    enabled: true
    generate: true  # Generate self-signed certificates
    certFile: "/app/certs/server.crt"
    keyFile: "/app/certs/server.key"
    # If generate is false, provide existing certificates
    existingSecret: ""
```

## Monitoring and Observability

### Health Checks

The service includes liveness and readiness probes:

- **Endpoint**: `https://localhost:8443/api/health`
- **Initial delay**: 30s (liveness), 10s (readiness)
- **Check interval**: 10s (liveness), 5s (readiness)

### Log Collection

Application logs are stored in the `/app/logs` directory and persisted to PVC.

### Prometheus Monitoring

Enable monitoring features:

```yaml
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    namespace: monitoring
    interval: 30s
```

## Maintenance Operations

### Upgrade

```bash
# Helm upgrade
helm upgrade fastrg-controller deployment/helm/fastrg-controller/ -f values.yaml

# Check upgrade status
helm history fastrg-controller
kubectl rollout status deployment/fastrg-controller -n fastrg-system
```

### Backup

```bash
# Backup etcd data
kubectl exec -n fastrg-system deployment/etcd -- etcdctl snapshot save /etcd-data/backup.db

# Copy backup file
kubectl cp fastrg-system/etcd-pod:/etcd-data/backup.db ./etcd-backup-$(date +%Y%m%d).db
```

### Troubleshooting

```bash
# Check Pod status
kubectl get pods -n fastrg-system
kubectl describe pod <pod-name> -n fastrg-system

# Check logs
kubectl logs <pod-name> -n fastrg-system
kubectl logs <pod-name> -c init-container -n fastrg-system

# Check services
kubectl get services -n fastrg-system
kubectl describe service fastrg-controller-service -n fastrg-system

# Check certificates
kubectl exec -n fastrg-system deployment/fastrg-controller -- ls -la /app/certs/
```

### Cleanup

```bash
# Uninstall using Helm
helm uninstall fastrg-controller

# Or delete using kubectl
kubectl delete -f deployment/k8s/

# Clean up PVC (Note: This will delete data)
kubectl delete pvc -n fastrg-system --all

# Delete namespace
kubectl delete namespace fastrg-system
```

## Security Considerations

### Network Security

- Use TLS encryption for all communications
- Configure appropriate NetworkPolicy
- Restrict Pod-to-Pod communication

### Certificate Management

- Regular certificate rotation
- Use cert-manager for automatic management
- Monitor certificate expiration times

### RBAC

Ensure principle of least privilege:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: fastrg-controller-role
  namespace: fastrg-system
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

### Secret Management

- Use Kubernetes Secrets for sensitive data
- Enable encryption at rest
- Consider external secret management systems

## Performance Tuning

### Resource Configuration

Adjust resource requests and limits based on load:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### etcd Tuning

```yaml
etcd:
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  config:
    quota-backend-bytes: 8589934592  # 8GB
    max-request-bytes: 10485760      # 10MB
```

### Horizontal Scaling

```yaml
replicaCount: 3
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```
