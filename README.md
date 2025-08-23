# Table of Contents
* [Raspberry Pi Setup](/docs/raspberry_pi_setup.md)
* [Get Started](/docs/Get_Started.md)
### Cowrie
* [Cowrie Installation](/docs/Cowrie.md)
* [Cowrie Plugin Login](/docs/Cowrie_Plugin[1].md)
* [Cowrie Plugin Fake file system](/docs/Cowrie_Plugin[2].md)
### OpenCanary
* [OpenCanary Installation](/docs/OpenCanary.md)
* [OpenCanary Plugin Http/Https Mockup](/docs/Opencanary_Plugin[1].md)
# dashboard-honeypot

## front-end
```
npm create vite@latest
```
```
npm install
```
```
npm i axios
```
```
npm i react-router-dom
```
```
npm install @mui/material @emotion/react @emotion/styled
```
```
npm install @mui/x-charts
```
```
npm i antd
```
```
npm install markdown-it
```
```
npm install --save-dev @types/markdown-it
```

```
npm install react@latest react-dom@latest
```
```
npm install aos --save
```
```
npm install --save-dev @types/aos
```


## backend
```
npm init -y
```
```
npm install express cors morgan bcryptjs jsonwebtoken prisma socket.io dotenv nodemon sqlite3
```

### prisma
```
npm install prisma
```
```
npm install @prisma/client
```

### ค่าดีฟอลแตกต่างกัน
```
npx prisma init --datasource-provider mysql
```
```
npx prisma init --datasource-provider postgresql
```
```
npx prisma init --datasource-provider sqlite
```
```
npx prisma init
```

### DATABASE_URL ความต่าง
```
DATABASE_URL="mysql://root:password@localhost:3306/mydb"
```
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
```

```
npx prisma migrate dev --name init  รันทุกครั้งที่แก้ schema
``` 
```
npx prisma migrate dev --name updated-schema รันทุกครั้งที่แก้ schema
```

### ถ้าจะให้มันอ่านฐานข้อมูลที่มีอยู่แล้ว
```
npx prisma db pull
```
```
npx prisma generate
```


### validate
```
npm install yup
```


### Authenticate
```
npm install bcryptjs jsonwebtoken
```


## ขั้นตอนการใช้งาน
```
=====front-end=====
```
```
cd .\DashboardV2
```
```
npm run dev
```

```
=====back-end=====
```
```
cd .\sever\API\CowrieAPI
```
```
npm run dev
```

```
=====python=====
```
```
cd .\sever\API
```
```
python3 cowrie_logV2.py
```



