// 3SpeakVideoUtils.ts

export function transform3SpeakContent(content: string): string {
    const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9.-_]+\/[a-zA-Z0-9]+))\)/;
    const match = content.match(regex);
    if (match) {
        const videoURL = match[2];
        const videoID = match[3];
        const iframe = `<iframe width="560" height="315" src="https://3speak.tv/embed?v=${videoID}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        content = content.replace(regex, iframe);
    }
    return content;
}
