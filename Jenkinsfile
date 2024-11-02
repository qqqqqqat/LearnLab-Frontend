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
                // แสดง IP ของ Node
                
                
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

                    # หยุดการทำงาน dev server หากกำลังทำงานอยู่
                    pid=$(lsof -i :3000 -t || true)
                    if [ -n "$pid" ]; then
                        echo "Stopping running dev server (PID: $pid)"
                        kill -9 "$pid"
                    fi

                    # เริ่ม dev server ใหม่
                    echo "Starting npm run dev"
                    npm run dev
                '''
                sh 'echo "Node IP Address: $(hostname -I):3000"'
            }
        }
    }
}
