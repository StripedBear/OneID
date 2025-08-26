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

npm run dev -- -H 0.0.0.0 -p 3000
uvicorn app.main:app --host 0.0.0.0 --port 8000

todo: docker image
