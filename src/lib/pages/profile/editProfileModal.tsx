import React, { useEffect, useState } from 'react';
import { Textarea, Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { KeychainSDK, KeychainKeyTypes, Broadcast } from 'keychain-sdk';
import { css } from '@emotion/react'; // Add this line

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
    const [name, setName] = useState<string>(user.profile?.name || '');
    const [about, setAbout] = useState<string>(user.profile?.about || '');
    const [avatarUrl, setAvatarUrl] = useState<string>(user.profile?.profile_image || '');
    const [coverImageUrl, setCoverImageUrl] = useState<string>(user.profile?.cover_image || '');
    const [website, setWebsite] = useState<string>(user.profile?.website || '');

  useEffect(() => {
    if (user && user.posting_json_metadata) {
      try {
        const metadata = JSON.parse(user.posting_json_metadata);
        // Update the state values only if they are not already set
        setName(name => name || metadata.profile.name || '');
        setAbout(about => about || metadata.profile.about || '');
        setAvatarUrl(avatarUrl => avatarUrl || metadata.profile.profile_image || '');
        setCoverImageUrl(coverImageUrl => coverImageUrl || metadata.profile.cover_image || '');
        setWebsite(website => website || metadata.profile.website || '');
        console.log(metadata);
      } catch (error) {
        console.error('Error parsing JSON metadata:', error);
      }
    }
  }, [user]);

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
                    cover_image: coverImageUrl,
                    profile_image: avatarUrl,
                    website: website,
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
            <Textarea
                placeholder="About"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                css={css`
                    white-space: wrap;
                    min-height: 150px; // Adjust the minHeight value as needed
                `}
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
            <Text> Website</Text>
            <Input
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
            />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button color={"limegreen"} border={"1px dashed limegreen"} onClick={sendEditTransaction} variant="ghost">
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
