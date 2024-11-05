pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                    args '-u root'
                }
            }
            steps {
                // ตรวจสอบว่า node_modules มีอยู่แล้วหรือไม่ ถ้าไม่มีก็ให้ติดตั้ง npm packages ใหม่
                sh '''
                    echo "Checking npm and starting build..."
                    
                    # เช็ค npm version
                    npm --version

                    # ตรวจสอบว่า package-lock.json มีอยู่และ node_modules ยังไม่มีการติดตั้ง
                    if [ ! -d "node_modules" ]; then
                        echo "node_modules not found, running npm install"
                        npm install
                    else
                        echo "node_modules already exists, skipping npm install"
                    fi

                    echo "Starting npm run build"
                    npm run build
                    echo "npm run build fin"
                '''
            }
        }
    }
}
