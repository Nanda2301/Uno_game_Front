import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LobbyPage from "./pages/LobbyPage";
import CreateGamePage from "./pages/CreateGamePage";
import GamePage from "./pages/GamePage";
import WinnerPage from "./pages/WinnerPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div
          className="min-h-screen w-full bg-[#b72428] bg-no-repeat bg-left"
          style={{
            backgroundImage: "url('https://i.imgur.com/HWTtTYF.png')",
            backgroundSize: "contain"
          }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/lobby"
              element={
                <ProtectedRoute>
                  <LobbyPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateGamePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/game/:id"
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/winner/:id"
              element={
                <ProtectedRoute>
                  <WinnerPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;