# 🏗 BuildSphere Mobile Project

## 📱 Mobile App Setup (Frontend)
1. Navigate to `Frontend` directory.
2. Install dependencies: `npm install`.
3. Check `.env` file and ensure `EXPO_PUBLIC_API_URL` is set to your laptop's **LAN IP** (e.g., `http://192.168.0.199:3001`).
4. Run: `npx expo start -c`.
5. **Push Notifications**:
   - Remote push notifications do not fully work in **Expo Go** on Android SDK 53+.
   - For real testing, you need to run `npx eas project:init` and then use a **Development Build** (`npx expo run:android`).

## 🖥 Backend Setup (Server)
1. Navigate to `Server` directory.
2. Install dependencies: `npm install`.
3. Run: `npm start`.
4. The server is configured to listen on `0.0.0.0:3001` to be accessible over the network.

## 🔍 CV Service Setup (Python)
1. Navigate to `CV-Service` directory.
2. Activate venv: `.\venv\Scripts\activate`.
3. Run: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`.

## 🌐 Network Troubleshooting
- **Same WiFi**: Your phone and laptop **MUST** be on the same WiFi network.
- **Firewall**: Ensure your laptop's firewall allows incoming connections on ports `3001` (Backend) and `8000` (CV Service).
- **IP Address**: Use your laptop's LAN IP (`ipconfig`), NOT `localhost` or `127.0.0.1`.