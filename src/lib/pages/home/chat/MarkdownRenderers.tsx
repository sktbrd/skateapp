import React from 'react';

type MarkdownProps = {
    node?: any;
    alt?: any;
    src?: any;
    title?: any;
    value?: any; // Add this line to include the 'value' property
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
h2: ({ children, ...props }: RendererProps) => <h2 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '22px', paddingBottom: '8px' , paddingTop: '8px' }}>{children}</h2>,
h3: ({ children, ...props }: RendererProps) => <h3 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '20px', paddingBottom: '6px' , paddingTop: '8px'}}>{children}</h3>,
h4: ({ children, ...props }: RendererProps) => (
  <h4 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '16px', paddingBottom: '4px', paddingTop: '4px' }}>
    {children}
  </h4>
),
blockquote: ({ children, ...props }: RendererProps) => <blockquote {...props} style={{ borderLeft: '3px solid red', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,
ol: ({ ordered, children, ...props }: RendererProps) => {
    const listType = ordered ? "1" : "decimal";
    return <ol {...props} style={{ listStyleType: listType, paddingLeft: '20px' }}>{children}</ol>;
},

ul: ({ children, ...props }: RendererProps) => {
    return <ul {...props} style={{ paddingLeft: '20px' }}>{children}</ul>;
},
li: ({ children, ...props }: RendererProps) => {
    return (
        <div style={{ paddingLeft: '10px' }}>
            <li {...props} style={{ padding: '10px', listStylePosition: 'outside' }}>{children}</li>
        </div>
    );
},

hr: ({ children, ...props }: RendererProps) => <hr {...props} style={{ paddingBottom: '20px' }}>{children}</hr>,
strong: ({ children, ...props }: RendererProps) => <strong {...props} style={{ color: 'yellow' }}>{children}</strong>,

br: ({ children, ...props }: RendererProps) => <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>,

table: ({ children, ...props }: RendererProps) => (
    <div style={{ overflowX: 'auto' }}>
      <table {...props} style={{ borderCollapse: 'collapse', width: '100%' }}>
        {children}
      </table>
    </div>
  ),

  tbody: ({ children, ...props }: RendererProps) => (
    <tbody {...props}>{children}</tbody>
  ),

  tr: ({ children, ...props }: RendererProps) => (
    <tr {...props}>{children}</tr>
  ),

  th: ({ children, ...props }: RendererProps) => (
    <th
      {...props}
      style={{
        border: '1px solid black',
        padding: '8px',
        fontWeight: 'bold',
        textAlign: 'left',
      }}
    >
      {children}
    </th>
  ),
  

  td: ({ children, ...props }: RendererProps) => (
    <td
      {...props}
      style={{
        border: '1px solid black',
        padding: '8px',
        textAlign: 'left',
      }}
    >
      {children}
    </td>
    
  ),

};

