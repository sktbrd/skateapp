import React, { ReactNode } from 'react';

interface MarkdownComponentsProps {
  children: ReactNode[]; // Change the prop type to an array of ReactNode
  
}

const MarkdownComponents: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    </>
  );
};

export const MarkdownBlockquote: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <blockquote
      style={{
        borderLeft: '3px solid limegreen',
        paddingLeft: '10px',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote> 
  );
};

export const MarkdownAnchor: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <a {...props} style={{ color: 'yellow' }}>
      {children}
    </a>
  );
};

export const MarkdownH1: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <h1
      style={{
        fontWeight: 'bold',
        color: 'yellow',
        fontSize: '24px',
      }}
    >
      {children}
    </h1>
  );
};

export const MarkdownH2: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <h2
      style={{
        fontWeight: 'bold',
        color: 'yellow',
        fontSize: '20px',
      }}
    >
      {children}
    </h2>
  );
};

export const MarkdownH3: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <h3
      style={{
        fontWeight: 'bold',
        color: 'yellow',
        fontSize: '18px',
      }}
    >
      {children}
    </h3>
  );
};

export const MarkdownUl: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <ul style={{ paddingLeft: '20px' }} {...props}>
      {children}
    </ul>
  );
};


export const MarkdownOl: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
  return (
    <ol style={{ paddingLeft: '20px' }} {...props}>
      {children}
    </ol>
  );
};

export const MarkdownIframe: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    );
  };

  
  export const MarkdownContent: React.FC<MarkdownComponentsProps> = ({ children, ...props }) => {
    return (
      <>{children}</>
    );
  };

export default MarkdownComponents;
