Simple Node.js HTTP Proxy
=========================

Due to firewall constraints I needed to proxy requests through a Kubernetes Cluster. I decided using
node.js was the simplest way to do it.

It's a very simple node.js server application that can be run locally using `npm`:

    npm install
    npm start <proxy-target>

Building the Docker Image
-------------------------

Build the image with Docker

    docker build -t pbatey/simple-node-proxy .

Running with Docker
-------------------

Run the proxy by supplying it with a proxy target:

    docker run -P pbatey/simple-node-proxy npm start <proxy-target>

Find the exposed ip address and port using docker:

    $ docker-machine ip
    192.168.99.100
    $ docker port $(docker ps | awk '/simple-node-proxy/ {print $1}')
    8080/tcp -> 0.0.0.0:32768

You can then connect to the proxy:

    curl 192.168.99.100:32768

Running with Kubernetes
-----------------------

Ultimately I needed to run this on a Kubernetes Cluster with an externally accessible port. To do this I
needed to create a pod and a service on the cluster.

### Configure the proxy

I created a kubernetes configuration file `merlin-proxy.yaml` with the proxy-target set
to `http://mwsprod.ccp.xcal.tv:9003`:

```
apiVersion: v1
kind: Pod
metadata:
  name: merlin-proxy
  labels:
    app: merlin-proxy
spec:
  restartPolicy: Never
  containers:
  - name: merlin-proxy
    image: "pbatey/simple-node-proxy"
    command: ["npm", "start", "http://mwsprod.ccp.xcal.tv:9003"]

---

apiVersion: v1
kind: Service
metadata:
  name: merlin-proxy
spec:
  type: LoadBalancer
  selector:
    app: merlin-proxy
  ports:
  - port: 8080
```

### Launch the proxy

Create the pod and service with kubectl:

    kubectl create -f merlin-proxy.yaml

### Find the exposed port

Find the exposed ip address and port using kubectl:

    $ kubectl cluster-info
    Kubernetes master is running at http://96.118.54.90:8080
    $ kubectl describe svc merlin-proxy | awk '/NodePort:/ {print $3}'
    30316/TCP

You can then connect to the proxy:

    curl 96.118.54.90:30316
