import React from 'react';

type MarkdownProps = {
    node?: any;
    alt?: any;
    src?: any;
    title?: any;
  };
  
  type RendererProps = MarkdownProps & {
    children?: React.ReactNode;
    ordered?: any;
  };
  
  
export const MarkdownRenderers = {
img: ({ alt, src, title, ...props }: RendererProps) => (
    <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img {...props} alt={alt} src={src} title={title} style={{ maxWidth: '100%', height: 'auto', borderRadius: "10px", border: '1px solid limegreen' }} />
    </span>
    ),
a: ({ children, ...props }: RendererProps) => <a {...props} style={{ color: 'yellow' }}>{children}</a>,
h1: ({ children, ...props }: RendererProps) => <h1 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '26px', paddingBottom: '10px' }}>{children}</h1>,
h2: ({ children, ...props }: RendererProps) => <h2 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '20px', paddingBottom: '8px' }}>{children}</h2>,
h3: ({ children, ...props }: RendererProps) => <h3 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '18px', paddingBottom: '6px' }}>{children}</h3>,
blockquote: ({ children, ...props }: RendererProps) => <blockquote {...props} style={{ borderLeft: '3px solid red', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,
ol: ({ ordered, children, ...props }: RendererProps) => {
    const listType = ordered ? "1" : "decimal";
    return <ol {...props} style={{ listStyleType: listType, paddingLeft: '20px' }}>{children}</ol>;
},

ul: ({ children, ...props }: RendererProps) => {
    return <ul {...props} style={{ paddingLeft: '20px' }}>{children}</ul>;
},
hr: ({ children, ...props }: RendererProps) => <hr {...props} style={{ paddingBottom: '20px' }}>{children}</hr>,
br: ({ children, ...props }: RendererProps) => <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>,
iframe: ({ ...props }: RendererProps) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <iframe 
        {...props} 
        style={{ 
        border: '1px solid limegreen', 
        borderRadius: '10px', 
        width: '560px',
        height: '315px',
        }} 
    /> 
    </div>
),
};

