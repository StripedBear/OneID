🔧 Backend (FastAPI)
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload


✅ Сервер поднимется на http://localhost:8000

🖥️ Frontend (Next.js + TailwindCSS)
cd frontend
npm install
npm run dev


✅ Клиент доступен на http://localhost:3000
