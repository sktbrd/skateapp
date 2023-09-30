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
        <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding:'20px' }}>
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
            }}
            onError={(e) => {
              // Handle image loading error by replacing the source with a default image
              e.currentTarget.src = 'https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafkreidxxr42k6sff4ppctl4l3xvh52rf2m7vzdrjmyqhoijveevwafkau&w=3840&q=75'; // Replace with the URL of your default image
            }}
          />
        </span>
      ),
      
a: ({ children, ...props }: RendererProps) => <a {...props} style={{ color: 'yellow' }}> {children} <br/></a>,

h1: ({ children, ...props }: RendererProps) => <h1 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '26px', paddingBottom: '10px' , paddingTop:"10px" }}>{children}</h1>,
h2: ({ children, ...props }: RendererProps) => <h2 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '20px', paddingBottom: '8px' , paddingTop:"10px"}}>{children}</h2>,
h3: ({ children, ...props }: RendererProps) => <h3 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '18px', paddingBottom: '6px' , paddingTop:"10px"}}>{children}</h3>,
h4: ({ children, ...props }: RendererProps) => <h4 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '16px', paddingBottom: '4px' , paddingTop:"10px"}}>{children}</h4>,
blockquote: ({ children, ...props }: RendererProps) => <blockquote {...props} style={{ borderLeft: '3px solid red', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,
ol: ({ ordered, children, ...props }: RendererProps) => {
    const listType = ordered ? "1" : "decimal";
    return <ol {...props} style={{ listStyleType: listType, paddingLeft: '20px' }}>{children}</ol>;
},

ul: ({ ordered, children, ...props }: RendererProps) => {
  const listType = ordered ? "1" : "decimal";
  return <ul {...props} data-ordered={listType} style={{ paddingLeft: '20px' }}>{children}</ul>;
},


hr: ({ children, ...props }: RendererProps) => <hr {...props} style={{ paddingBottom: '20px' }}>{children}</hr>,
br: ({ children, ...props }: RendererProps) => <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>,
pre: ({ children, ...props }: RendererProps) => (
    <code
      {...props}
      style={{
        backgroundColor: 'gray',
        color: 'pink',
        
        maxWidth: '100%', // Set maximum width to 100% of parent container (the modal)
        overflowX: 'auto', // Allow horizontal scrolling if content overflows
      }}
    >
      {children}
    </code>
  ),
  iframe: ({ src, ...props }: RendererProps) => (
    <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop:'10px' }}>

    <iframe
      {...props}
      src={src}
      style={{ borderRadius: '10px', marginBottom: '20px', border:'1px limegreen solid' /* You can adjust the value as needed */ }}
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

