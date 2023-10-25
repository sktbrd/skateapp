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
  
  
export const MarkdownRenderersUpload = {
  
  img: ({ alt, src, title, ...props }: RendererProps) => (
    <span
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <img
        {...props}
        alt={alt}
        src={src}
        title={title}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '10px',
          border: '1px solid limegreen',
          margin: '0 auto', // Center the image horizontally using margin
        }}
        onError={(e) => {
          // Handle image loading error by replacing the source with a default image
          e.currentTarget.src =
            'https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafkreidxxr42k6sff4ppctl4l3xvh52rf2m7vzdrjmyqhoijveevwafkau&w=3840&q=75'; // Replace with the URL of your default image
        }}
      />
    </span>
  ),
  
      
a: ({ children, ...props }: RendererProps) => <a {...props} style={{ color: 'yellow' }}> {children} <br/></a>,

h1: ({ children, ...props }: RendererProps) => <h1 {...props} style={{ fontWeight: 'bold', color: 'grey', fontSize: '48px', paddingBottom: '10px' , paddingTop:"10px" }}>{children}</h1>,
h2: ({ children, ...props }: RendererProps) => <h2 {...props} style={{ fontWeight: 'bold', color: 'grey', fontSize: '36px', paddingBottom: '8px' , paddingTop:"10px"}}>{children}</h2>,
h3: ({ children, ...props }: RendererProps) => <h3 {...props} style={{ fontWeight: 'bold', color: 'grey', fontSize: '30px', paddingBottom: '6px' , paddingTop:"10px"}}>{children}</h3>,
h4: ({ children, ...props }: RendererProps) => <h4 {...props} style={{ fontWeight: 'bold', color: 'grey', fontSize: '26px', paddingBottom: '4px' , paddingTop:"10px"}}>{children}</h4>,
blockquote: ({ children, ...props }: RendererProps) => (
  <div
    style={{
      backgroundColor: '#333',
      padding: '16px',
      borderLeft: '4px solid #FFD700', // Gold border
      margin: '20px 0',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      color: '#FFF',
      fontStyle: 'italic',
      fontSize: '18px',
      lineHeight: '1.5',
    }}
  >
    <p style={{ margin: '0' }}>
      {children}
    </p>
  </div>
),

ol: ({ ordered, children, ...props }: RendererProps) => {
    const listType = ordered ? "1" : "decimal";
    return <ol {...props} style={{ listStyleType: listType, paddingLeft: '10%' }}>{children}</ol>;
},

ul: ({ ordered, children, ...props }: RendererProps) => {
  const listType = ordered ? "1" : "decimal";
  return <ul {...props} data-ordered={listType} style={{ paddingLeft: '10%' }}>{children}</ul>;
},

sub: ({ children, ...props }: RendererProps) => (<sub {...props} style={{color: 'red' }}>{children}</sub>),
hr: ({ children, ...props }: RendererProps) => <hr {...props} style={{ paddingBottom: '20px' }}>{children}</hr>,
br: ({ children, ...props }: RendererProps) => <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>,
pre: ({ children, ...props }: RendererProps) => (
  <div
    style={{
      backgroundColor: '#1E1E1E', // Dark gray background
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      overflowX: 'auto', // Horizontal scrollbar for long code lines
    }}
  >
    <code
      {...props}
      style={{
        color: '#A9B7C6', // Light gray text color
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
    >
      {children}
    </code>
  </div>
),


  iframe: ({ src, ...props }: RendererProps) => (
    <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop:'10px' , minWidth: '100%', minHeight: 'auto'}}>

    <iframe
      {...props}
      src={src}
      style={{ borderRadius: '10px', marginBottom: '20px', border:'1px yellow solid', minWidth: '600px', minHeight: '400px'}}
    />
    </span>
  ),
  table: ({ children, ...props }: RendererProps) => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <table {...props}>{children}</table>
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

