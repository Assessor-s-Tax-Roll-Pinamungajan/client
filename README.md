Assessor's Tax Roll System - Pinamungajan
=========================================

A LAN-based system for managing and displaying the municipality's tax roll records.  
This project consists of two repositories:

- Server: https://github.com/Assessor-s-Tax-Roll-Pinamungajan/server.git
- Client: https://github.com/Assessor-s-Tax-Roll-Pinamungajan/client.git

------------------------------------------------------------

How to Run Locally
------------------

1. Clone the repositories  
   git clone https://github.com/Assessor-s-Tax-Roll-Pinamungajan/server.git  
   git clone https://github.com/Assessor-s-Tax-Roll-Pinamungajan/client.git  

2. Check Node.js version  
   node --version  

3. Setup Client  
   cd client  
   npm install  
   npm run start  

4. Setup Server  
   cd server  
   npm install  

   Create a new .env file inside the server folder with this content:  
   DATABASE_URL="file:./reyal.db"  

   Generate Prisma client:  
   npx prisma generate  

   Start the server:  
   npm start  

5. (Optional) Seed Bulk Data  
   If you need initial data for testing, update seed.ts based on schema.prisma, then run:  
   npx prisma db seed  

------------------------------------------------------------  

Notes  
-----  
- The system is intended to run within the Assessor’s Office LAN setup.  
- No login functionality is included.  
- Data can be viewed, edited, and added, but not deleted.  
