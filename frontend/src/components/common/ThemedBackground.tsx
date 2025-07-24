import { useTheme } from '../../context/ThemeContext';
import { ReactNode } from 'react';

const ThemedBackground = ({ children }: { children: ReactNode }) => {
  const { darkMode } = useTheme();

  return (
    <div 
      className="w-full h-full bg-cover bg-center"
      style={{
        backgroundImage: `url(${darkMode ? '/dark-bg.jpg' : '/light-bg.jpg'})`,
        transition: 'background-image 0.5s ease-in-out'
      }}
    >
      {children}
    </div>
  );
};

export default ThemedBackground;