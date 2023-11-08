import React, { useState } from "react";
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
} from "@chakra-ui/react";

import useAuthUser from "./useAuthUser.js";

interface HiveLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

const HiveLogin: React.FC<HiveLoginProps> = ({ isOpen, onClose}) => {
  const [username, setUsername] = useState("");
  const { loginWithHive, user } = useAuthUser();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginWithHive(username);
    setUsername("");
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSignUp = () => {
    window.open("https://discord.gg/skatehive", "_blank");
  };
  const logout = () => {
    setUsername("");
    sessionStorage.removeItem("user");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit} backgroundColor="black" border="1px solid #5E317A">
        <ModalHeader color="#5E317A"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>𐕣 𖤐 𐕣 <p style={{ margin: '10px' }}>Faça seu pacto </p> 𐕣 𖤐 𐕣</div></ModalHeader>
        <Image border="1px solid #5E317A" margin="20px" borderRadius="10px" src="assets/michael-myers-halloween.gif" alt="SkateHive" />
        <ModalCloseButton color="#5E317A"/>
        <ModalBody>
          {user && user.name ? (
            <p>Welcome, {user.name}!</p>
          ) : (
            <>
              <Input
                type="text"
                name="username"
                color="white"
                placeholder="Username"
                backgroundColor="black"
                border="3px solid #5E317A"
                value={username}
                onChange={handleInputChange}
                required
              />
              <Flex paddingTop="20px" justifyContent={"center"}>

              <Button
  border="1px solid #65418C"
  type="submit"
  backgroundColor="#65418C"
  style={{ transition: "background-color 0.3s" }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#E0001B"}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#65418C"}
>
  Assinar Pacto
</Button>


              </Flex>
              
            </>
          )}
        </ModalBody>
        <ModalFooter>
        {user && user.name ? (
          <>
            <Button border="1px solid red" onClick={logout}>LogOut</Button>
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
