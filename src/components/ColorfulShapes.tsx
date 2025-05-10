
import React from 'react';

interface ColorfulShapesProps {
  className?: string;
}

const ColorfulShapes: React.FC<ColorfulShapesProps> = ({ className }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      {/* Blob 1 */}
      <div 
        className="absolute -top-24 -left-24 w-64 h-64 bg-friendly-blue/20 rounded-full blur-3xl animate-float" 
        style={{ animationDelay: "0s" }}
      />
      
      {/* Blob 2 */}
      <div 
        className="absolute top-1/4 -right-32 w-72 h-72 bg-friendly-purple/20 rounded-full blur-3xl animate-float" 
        style={{ animationDelay: "1s" }}
      />
      
      {/* Blob 3 */}
      <div 
        className="absolute bottom-1/3 -left-20 w-52 h-52 bg-friendly-teal/20 rounded-full blur-3xl animate-float" 
        style={{ animationDelay: "2s" }}
      />
      
      {/* Blob 4 */}
      <div 
        className="absolute -bottom-32 right-1/4 w-80 h-80 bg-friendly-yellow/20 rounded-full blur-3xl animate-float" 
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
};

export default ColorfulShapes;
