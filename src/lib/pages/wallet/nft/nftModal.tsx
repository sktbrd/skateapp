import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Image,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { KeychainSDK, KeychainKeyTypes, Broadcast } from 'keychain-sdk';
import * as dhive from "@hiveio/dhive";


import useAuthUser from "lib/pages/home/api/useAuthUser";

interface NFTModalProps {
    isOpen: boolean;
    onClose: () => void;
    nftImageUrl: string;
    nftName: string;
    nftCollection: string; 
  }
  const client = new dhive.Client([
    "https://api.hive.blog",
    "https://api.hivekings.com",
    "https://anyx.io",
    "https://api.openhive.network",
  ]);

  const NFTModal: React.FC<NFTModalProps> = ({ isOpen, onClose, nftImageUrl, nftName, nftCollection  }) => {
    

    const user = useAuthUser();
    const [name, setName] = useState<string>('');
    const [about, setAbout] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [coverImageUrl, setCoverImageUrl] = useState<string>('');
    const [website, setWebsite] = useState<string>('');


    const onStart = async function () {
        if (user && user.user?.name) {
      try {
        const accounts = await client.database.call('get_accounts', [[user.user.name]]);
        const account = accounts[0]; // Assuming there's only one account with the provided name

        if (account.posting_json_metadata) {
          const postingMetadata = JSON.parse(account.posting_json_metadata);
          setName(name => name || postingMetadata.profile.name || '');
            setAbout(about => about || postingMetadata.profile.about || '');
            setAvatarUrl(avatarUrl => avatarUrl || postingMetadata.profile.profile_image || '');
            setCoverImageUrl(coverImageUrl => coverImageUrl || postingMetadata.profile.cover_image || '');
            setWebsite(website => website || postingMetadata.profile.website || '');
        }

          } catch (error) {
            console.error('Error parsing JSON metadata:', error);
          }
        }
        }
        useEffect(() => {
          onStart();
        }, [user]);

      const sendEditTransaction = async () => {
        try {
          const keychain = new KeychainSDK(window);
        console.log(user)
        const formParamsAsObject = {
          data: {
            username: user.user?.name,
            operations: [
              [
                'account_update2',
                {
                  account: user.user?.name,
                  json_metadata: JSON.stringify({
                    profile: {
                      name: name,
                      about: about,
                      cover_image: coverImageUrl,
                      profile_image: nftImageUrl,
                      website: website,
                    },
                  }),
                  posting_json_metadata: JSON.stringify({
                    profile: {
                      name: name,
                      about: about,
                      cover_image: coverImageUrl,
                      profile_image: nftImageUrl,
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
        const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
  
      } catch (error) {
        console.error(error);
      }
    };
  
    
      const handleClickSetAvatar = () => {
        sendEditTransaction();
        onClose();
      }
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="black" border={"1px dashed limegreen"} borderRadius="10px">
          <ModalHeader textAlign="center">NFT Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="center">
              <Image src={nftImageUrl} alt="NFT Image" borderRadius="10px" />
              <Text fontSize="lg" fontWeight="bold">
                {nftName}
                </Text>
              <Text fontSize="lg" fontWeight="bold">
                {nftCollection}
                </Text>
                <Button colorScheme="green" onClick={handleClickSetAvatar}>
                 Set as Avatar !
                </Button>
                
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button colorScheme="red" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  

export default NFTModal;
