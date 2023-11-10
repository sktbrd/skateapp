import React, { useState, useEffect } from "react";
import { Input, Box, List, ListItem, Avatar, Text, Button } from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";

interface AuthorSearchBarProps {
  onSearch: (selectedUsername: string) => void;
}

const AuthorSearchBar: React.FC<AuthorSearchBarProps> = ({ onSearch }) => {
  const [username, setUsername] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const client = new Client(["https://api.hive.blog"]);
  const [limit, setLimit] = useState(10)

  // const handleClearSearch = () => {
  //   setUsername("");
  //   setAuthors([]);
  // };

  const fetchAuthors = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await client.database.call("lookup_accounts", [query, limit]);
      setAuthors(result);
      console.log(authors)
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (username.trim() !== "") {
      fetchAuthors(username);
    } else {
      setAuthors([]);
    }
  }, [username]);

  const handleSearch = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setAuthors([]);
    onSearch(selectedUsername);
  };

  return (
    <Box position="relative">
      <Input
        placeholder="Encontre o fotógrafo"
        value={username}
        onChange={(e) => onSearch(e.target.value)}
        color='white'
        paddingRight="2rem"
      />
      {isLoading ? (
        <Box position="absolute" top="50%" right="0.5rem" transform="translateY(-50%)">
          <div>Loading...</div>
        </Box>
      ) : (
        <List position="absolute" top="100%" left="0" right="0" bg="white" 
        boxShadow="md" zIndex="999">
          <div>

          </div>
          {authors.map((author) => (
            <ListItem
              key={author}
              onClick={() => handleSearch(author)}
              p={2}
              cursor="pointer"
              display="flex"
              backgroundColor={"black"}
              border="1px limegreen solid"
              alignItems="center"
              _hover={{ bg: "gray.100" }}
            >
              <Avatar size="sm" src={`https://images.ecency.com/webp/u/${author}/avatar/small`} />
              <Text ml={2}>{author}</Text>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AuthorSearchBar;
