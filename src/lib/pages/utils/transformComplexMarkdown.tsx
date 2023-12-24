export function transformComplexMarkdown(content: string): string {
  // fix no enter after start and end of center tag, where direct text follows
  // <center>text -> <center>\n\ntext
  content = content.replace(/<center>([^<])/g, '<center>\n\n$1');
  // </center>text -> </center>\ntext
  content = content.replace(/<\/center>([^<])/g, '</center>\n$1');

  // if a closing tag has a new line after it, add another new line
  // </tag>\n -> </tag>\n\n
  content = content.replace(/<\/[^>]+>\n/g, (match) => match + '\n');

  // look for two inline images, add a space before the first one so its on column 2
  // only if the first one is not already on column 2 (has a space before it)
  // ![name](url)![name](url) -> ' ![name](url)![name](url)'
  const InlineRegex = /!\[[^\]]+\]\([^)]+\)!\[[^\]]+\]\([^)]+\)/g;
  let matchInlines;
  while ((matchInlines = InlineRegex.exec(content))) {
    const [fullMatch] = matchInlines;

    // make sure the letter before the link is not a ! or a space
    const index = matchInlines.index;
    const before = content[index - 1];
    if (before === ')' || before === ' ') {
      continue;
    }

    content = content.replace(fullMatch, ' ' + fullMatch);
  }


  // transform any links to embeds
  // [name](url) -> <a href="url">name</a>
  // but only if the url is not an image
  // ![name](url) -> <img src="url" alt="name" />
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;

  let match;
  while ((match = regex.exec(content))) {
    const [fullMatch, name, url] = match;

    // make sure the letter before the link is not a !
    const index = match.index;
    const before = content[index - 1];
    if (before === '!') {
      continue;
    }

    content = content.replace(fullMatch, `<a href="${url}">${name}</a>`);
  }

  // transform any independent links which are images or gifs
  // make sure the url has no spaces, or new lines
  // starting with http(s):// and ending with .(jpg|jpeg|png|gif|svg)
  // not inside "", or () or []

  const independentRegex = /(?<!\(|\)|\[|\")((http|https):\/\/[^\s\n]+?\.(jpg|jpeg|png|gif|svg))/g;
  let independentMatch;
  while ((independentMatch = independentRegex.exec(content))) {
    const [fullMatch, url] = independentMatch;

    // make sure the letter before the link is a space or a new line
    const index = independentMatch.index;
    const before = content[index - 1];
    const after = content[index + fullMatch.length];
    if (before !== ' ' && before !== '\n' && before !== undefined && before !== '') {
      continue;
    }

    let finalBefore = '';
    let finalAfter = '';
    
    if (before) {
      finalBefore = before;
    }

    if (after) {
      finalAfter = after;
    }

    content = content.replace(finalBefore + fullMatch, `${finalBefore}<img src="${url}" alt="" />${finalAfter}`);
  }


  return content;
}
