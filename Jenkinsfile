pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:22.11.0-alpine3.20'
                    reuseNode true
                    args '-u root -p 3000:3000' // แมพพอร์ต 3000 จาก container ไปยังพอร์ต 3000 บน host
                }
            }
            steps {
                // แสดง IP ของ Node
                
                
                sh '''
                    npm --version
                    npm ci
                    npm run dev
                '''
                sh 'echo "Node IP Address: $(hostname -I):3000"'
            }
        }
    }
}
