import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Flex,
  Image,
  Badge,
} from "@chakra-ui/react";

import useAuthUser from "./useAuthUser.js";

interface HiveLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

const HiveLogin: React.FC<HiveLoginProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [isHiveKeychainInstalled, setIsHiveKeychainInstalled] = useState(true);
  const { loginWithHive, user } = useAuthUser();

  useEffect(() => {
    // Check if Hive Keychain extension is available
    setIsHiveKeychainInstalled(!!window.hive_keychain);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lowerCaseUsername = username.toLowerCase();
    await loginWithHive(lowerCaseUsername);
    setUsername("");
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSignUp = () => {
    window.open("https://discord.gg/skateboard", "_blank");
  };

  const logout = () => {
    setUsername("");
    sessionStorage.removeItem("user");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit} backgroundColor="black" border="1px solid limegreen">
        <center>
          <ModalHeader>Hive Login</ModalHeader>
        </center>

        {!isHiveKeychainInstalled && (
          <Badge
            variant="solid"
            colorScheme="red"
            marginLeft={"40px"}
            marginRight={"40px"}
            p="1"
            borderRadius="lg"
          >
            <center>
             💀 Hive Keychain Not Installed
              <a href="/tutorial" style={{ color: 'limegreen' }}> - Install Here ! </a>
            </center>
          </Badge>
        )}


        <Image margin="20px" borderRadius="10px" src="assets/pepe_login.png" alt="SkateHive" />

        <ModalCloseButton />
        <ModalBody>
          {user && user.name ? (
            <p>Welcome, {user.name}!</p>
          ) : (
            <>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                backgroundColor="black"
                border="3px solid teal"
                value={username}
                onChange={handleInputChange}
                required
              />
              <Flex paddingTop="20px" justifyContent={"space-between"}>
                <Button border="1px solid red" type="submit">
                  Login
                </Button>
                <Button border="1px solid orange" type="button" onClick={handleSignUp}>
                  Help me
                </Button>
              </Flex>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {user && user.name ? (
            <>
              <Button border="1px solid red" onClick={logout}>
                LogOut
              </Button>
            </>
          ) : (
            <>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HiveLogin;
