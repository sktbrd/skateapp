// ------------ Feed -------------------

export type GnarsBlogProps = {
tags: string[];
}

export interface HiveBlogProps {
tag?: string;
queryType?: any;
}


// ------------ Comments -------------------
export interface CommentProps {
author: string;
body: string;
created: string;
net_votes: number;
permlink: string;
url: string;

}
export interface CommentsProps {
comments: CommentProps[];
commentPosted: boolean;
}

export interface CommentBoxProps {
user: any;
parentAuthor: string;
parentPermlink: string;
onCommentPosted: () => void;
}


// ------------ Post -------------------

export interface PostHeaderProps {
title: string;
author: string;
avatarUrl: string;
url: string;
permlink: string;
onClose: () => void;
}


export interface PostModalProps {
isOpen: boolean;
onClose: () => void;
title: string;
content: string;
author: string;
user: any;
permlink: string;
weight: number;
comments: CommentProps[];
url: string;
}
export interface PostProps {
author: string;
permlink: string;
thumbnail: string;
title: string;
body: string;
user: string;
weight: number;
earnings: number;
url: string;
}

export type Post = {
author: string;
permlink: string;
thumbnail: string;
title: string;
body: string;
user: string;
weight: number;
earnings: number;
url: string;
}

export interface PostFooterProps {
onClose: () => void;
user: any;  
author: string; 
permlink: string; 
weight?: number; 
}

export interface EarningsModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any; // Pass the selected post data here
  }

  export interface HiveVideosPostModalProps extends PostModalProps {
    post: Discussion;
  }
  