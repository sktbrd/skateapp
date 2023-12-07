import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { KeychainSDK, KeychainKeyTypes, KeychainOptions, Broadcast } from 'keychain-sdk';
interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
  }

  const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
    const [name, setName] = useState(user.profile?.name || '');
    const [about, setAbout] = useState(user.profile?.about || '');
    const [avatarUrl, setAvatarUrl] = useState<string>(user.profile?.avatarUrl || '');
    const [coverImageUrl, setCoverImageUrl] = useState<string>(user.profile?.coverImageUrl || '');
    // Add other state variables for additional fields
  
    const sendEditTransaction = async () => {
      try {
        const keychain = new KeychainSDK(window);
  
        const formParamsAsObject = {
          data: {
            username: user.name,
            operations: [
              [
                'account_update2',
                {
                  account: user.name,
                  json_metadata: '',
                  posting_json_metadata: JSON.stringify({
                    profile: {
                      name: name,
                      about: about,
                      avatarUrl: avatarUrl, // Include the new fields here
                      coverImageUrl: coverImageUrl, // Include the new fields here
                      // Add other profile fields here
                    },
                  }),
                  extensions: [],
                },
              ],
            ],
            method: KeychainKeyTypes.active,
          },
        };
  
        // Convert 'formParamsAsObject' to 'unknown' first
        const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
        console.log({ broadcast });
      } catch (error) {
        console.error(error);
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent bg={"black"} border={"1px solid limegreen"}>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text> Name</Text>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Text> About</Text>
            <Input
              placeholder="About"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
            <Text> Avatar URL</Text>
            <Input
              placeholder="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <Text> Cover Image URL</Text>
            <Input
              placeholder="Cover Image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
            {/* Add other input fields for additional profile information */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={sendEditTransaction} variant="ghost">
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default EditProfileModal;