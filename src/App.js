import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import TodoListPage from './pages/TodoListPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Dedicated route /to-do as requested */}
            <Route path="/to-do" element={<TodoListPage />} />
            <Route path="/to-do/login" element={<LoginPage />} />
            
            {/* Redirect / to /to-do */}
            <Route path="/" element={<Navigate to="/to-do" replace />} />
            
            {/* Catch-all redirect to /to-do */}
            <Route path="*" element={<Navigate to="/to-do" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
