# ใช้ Node.js base image
FROM node:22.11.0-alpine3.20

# ตั้งค่าตำแหน่งทำงานใน container
WORKDIR /app

# คัดลอกไฟล์ทั้งหมดจากโปรเจกต์ไปยัง container
COPY . .

# ประกาศให้พอร์ต 3000 สามารถเข้าถึงได้
EXPOSE 3000

# สั่งให้ container เริ่มทำงานด้วยคำสั่ง npm start
CMD ["npm", "start"]
