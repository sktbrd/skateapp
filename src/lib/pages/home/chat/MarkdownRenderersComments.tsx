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
  
  const transformCommentImageUrls = (content: string) => {
    // Regular expression to match image URLs
    const imageUrlRegex = /(https?:\/\/[^\s"<>]+?\.(?:jpg|jpeg|gif|png))(?![^<]*>|[^<>]*<\/)/gi;
    
    // Replace image URLs with markdown image syntax
    const transformedContent = content.replace(imageUrlRegex, "![]($1)");
    
    return transformedContent;
};


export const MarkdownRenderersComments:any = {
img: ({ alt, src, title, ...props }: RendererProps) => (
    <span style={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
        <img {...props} alt={alt} src={src} title={title} style={{ maxWidth: '10%', height: 'auto', borderRadius: "10px", border: '1px solid #5e317a' }} />
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

};

