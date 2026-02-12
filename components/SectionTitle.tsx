import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-lg text-gray-600">
        {subtitle}
      </p>
      <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6 rounded-full"></div>
    </div>
  );
};