# dashboard-honeypot

<h1>front-end</h1>
<p>npm create vite@latest</p>
<p>npm install</p>
<p>npm i axios</p>
<p>npm i react-router-dom</p>
<p>npm install @mui/material @emotion/react @emotion/styled</p>
<p>npm install @mui/x-charts</p>
<p>npm i antd</p>

<p>npm install react@latest react-dom@latest</p>
<p>npm install aos --save</p>
<p>npm install --save-dev @types/aos</p>


<h1>backend</h1>
<p>npm init -y</p>
<p>npm install express</p>
<p>npm install cors morgan nodemon sqlite3</p>

<h3>prisma</h3>
<p>npm install prisma</p>
<p>npm install @prisma/client</p>

<h3>ค่าดีฟอลแตกต่างกัน</h3>
<p>npx prisma init --datasource-provider mysql</p>
<p>npx prisma init --datasource-provider postgresql</p>
<p>npx prisma init --datasource-provider sqlite</p>
<p>npx prisma init</p>

<h3>DATABASE_URL ความต่าง</h3>
<p>DATABASE_URL="mysql://root:password@localhost:3306/mydb"</p>
<p>DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"</p>

<p>npx prisma migrate dev --name init  รันทุกครั้งที่แก้ schema</p> 
<p>npx prisma migrate dev --name updated-schema รันทุกครั้งที่แก้ schema</p>

<h3>ถ้าจะให้มันอ่านฐานข้อมูลที่มีอยู่แล้ว</h3>
<p>npx prisma db pull</p>
<p>npx prisma generate</p>


<h1>ขั้นตอนการใช้งาน</h1>
<p>=====front-end=====</p>
<p>cd .\DashboardV2</p>
<p>npm run dev</p>

<p>=====back-end=====</p>
<p>cd .\sever\API\CowrieAPI</p>
<p>npm run dev</p>

<p>=====python=====</p>
<p>cd .\sever\API</p>
<p>python3 cowrie_logV2.py</p>