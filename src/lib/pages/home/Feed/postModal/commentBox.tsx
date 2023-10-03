import React, { useState } from 'react';
import {
  Box,
  Textarea,
  Button
} from '@chakra-ui/react';

import * as Types from '../types'
import HiveLogin from '../../api/HiveLoginModal';


const CommentBox: React.FC<Types.CommentBoxProps> = ({ user, parentAuthor, parentPermlink, onCommentPosted }) => {
  const [commentContent, setCommentContent] = useState('');
  const [isHiveLoginModalOpen, setHiveLoginModalOpen] = useState(false); // State to control HiveLoginModal

  const handleCommentSubmit = () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!");
      return;
    }

    const username = user?.name;
    if (!username) {
      console.error("Username is missing");
      return;
    }

    const permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); // Generate a unique permlink for the comment

    const operations = [
      ["comment",
        {
          "parent_author": parentAuthor,
          "parent_permlink": parentPermlink,
          "author": username,
          "permlink": permlink,
          "title": "",
          "body": commentContent,
          "json_metadata": JSON.stringify({ tags: ["skateboard"], app: "skatehive" })
        }
      ]
    ];

    window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
        if (response.success) {
          alert("Comment successfully posted!");
          setCommentContent(''); // Clear the comment box
      
          // Call the callback to force re-render of Comments component
          onCommentPosted();
        } else {
          console.error("Error posting comment:", response.message);
        }
    });
  };

  return (
    <Box border="1px solid white" padding="10px" mt="20px">
      <Textarea
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Write your comment here..."
      />
      <Button border="1px solid white" mt="10px" onClick={handleCommentSubmit}>
        Submit Comment
      </Button>
      {isHiveLoginModalOpen && (
        <HiveLogin isOpen={true} onClose={() => setHiveLoginModalOpen(false)} />
      )}
    </Box>
  );
};

export default CommentBox;
