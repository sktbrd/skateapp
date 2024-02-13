const truncateTitle = (title: any, maxCharacters = 60) => {
    // full caps for title of post
    title = title.toUpperCase();

    if (title.length <= maxCharacters) {
        return title;
    } else {
        const truncatedTitle = title.substring(0, maxCharacters - 3) + "...";
        return truncatedTitle;
    }
};

export default truncateTitle;