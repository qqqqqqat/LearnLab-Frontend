pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:22.11.0-alpine3.20'
                    reuseNode true
                    args '-u root -p 3000:3000 -e HOST_IP=${HOST_IP}'
                }
            }
            environment {
                HOST_IP = "${InetAddress.getLocalHost().getHostAddress()}"
            }
            steps {
                sh '''
                    npm --version
                    npm ci
                    npm run dev
                '''
                sh 'echo "Node IP Address: ${HOST_IP}:3000"'
            }
        }
    }
}
