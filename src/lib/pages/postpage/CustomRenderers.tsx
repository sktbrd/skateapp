import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from './MarkdownRenderers';

const MarkdownInHtmlRenderer: React.FC<{ content?: string }> = ({ content = '' }) => {
  const elements: React.ReactNode[] = [];
  let currentText = '';

  const processText = (text: string) => {
    if (text.trim() !== '') {
      elements.push(
        <ReactMarkdown
          key={elements.length}
          children={text}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={MarkdownRenderers}
        />
      );
    }
  };

  let index = 0;
  while (index < content.length) {
    if (content[index] === '<') {
      processText(currentText);
      currentText = '';

      const endIndex = content.indexOf('>', index);
      if (endIndex !== -1) {
        const htmlTag = content.slice(index, endIndex + 1);

        // Check if the tag is a <div> element with an 'align' style
        if (htmlTag.startsWith('<div') && htmlTag.includes('align')) {
          const divElement = document.createElement('div');
          divElement.innerHTML = htmlTag;
          const alignStyle = (divElement.style as any).align;

          elements.push(
            <div
              key={elements.length}
              style={{ textAlign: alignStyle }}
              dangerouslySetInnerHTML={{ __html: htmlTag }}
            />
          );
        } else if (htmlTag.startsWith('<iframe')) {
          elements.push(
            <div
              key={elements.length}
              style={{
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid limegreen',
                borderRadius: '3px',
                maxWidth: '80%',
                margin: '0 auto',
              }}
              dangerouslySetInnerHTML={{ __html: htmlTag }}
            />
          );
        } else {
          elements.push(<span key={elements.length} dangerouslySetInnerHTML={{ __html: htmlTag }} />);
        }

        index = endIndex + 1;
      } else {
        break;
      }
    } else {
      currentText += content[index];
      index++;
    }
  }

  processText(currentText);

  return <React.Fragment>{elements}</React.Fragment>;
};

export default MarkdownInHtmlRenderer;
