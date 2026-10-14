import { useState } from 'react';
import type { Student } from './types/student';
import { LoginScreen } from './components/LoginScreen';
import { StudentList } from './components/StudentList';
import { StudentForm } from './components/StudentForm';
import { StudentCard } from './components/StudentCard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('admin_token');
  });
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'card'>('list');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (currentView === 'form') {
    return (
      <StudentForm
        studentToEdit={selectedStudent}
        onSave={() => {
          setSelectedStudent(null);
          setCurrentView('list');
        }}
        onCancel={() => {
          setSelectedStudent(null);
          setCurrentView('list');
        }}
      />
    );
  }

  if (currentView === 'card' && selectedStudent) {
    return (
      <StudentCard
        student={selectedStudent}
        onBack={() => {
          setSelectedStudent(null);
          setCurrentView('list');
        }}
        onEdit={() => {
          setCurrentView('form');
        }}
      />
    );
  }

  return (
    <StudentList
      onSelectStudent={(student) => {
        setSelectedStudent(student);
        setCurrentView('card');
      }}
      onNewStudent={() => {
        setSelectedStudent(null);
        setCurrentView('form');
      }}
      onLogout={handleLogout}
    />
  );
}