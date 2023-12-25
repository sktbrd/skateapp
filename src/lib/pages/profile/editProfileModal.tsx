import React, { useEffect, useState } from 'react';
import { Textarea, Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, HStack, Flex } from '@chakra-ui/react';
import { KeychainSDK, KeychainKeyTypes, Broadcast } from 'keychain-sdk';
import { css } from '@emotion/react';
import { FaUpload } from 'react-icons/fa';
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState<string>(user.profile?.name || '');
  const [about, setAbout] = useState<string>(user.profile?.about || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.profile?.profile_image || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(user.profile?.cover_image || '');
  const [extensions, setExtentions] = useState<any>((JSON.parse(user?.json_metadata)?.extensions) || "");
  const [website, setWebsite] = useState<string>(user.profile?.website || '');
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const { state } = usePioneer();
  const { app, status } = state;
  const [isEthSetupModalOpen, setIsEthSetupModalOpen] = useState(false);
  const [ethAddress, setEthAddress] = useState<string>(extensions?.eth_address || '');



  const onStart = async function () {
    try {
      if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {
        const connected_address = app.wallets[0].wallet.accounts[0];
        setConnectedAddress(connected_address);
      } else {
        console.error("Some properties are undefined or null");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    onStart();
  }
    , [app, status]);

  const handleClickaddEthAddress = async () => {
    setEthAddress(connectedAddress);
    setIsEthSetupModalOpen(false);
  }

  const EthSetupModal = () => {
    return (
      <Modal isOpen={isEthSetupModalOpen} onClose={() => setIsEthSetupModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent bg={"black"} border={"1px solid limegreen"}>
          <ModalHeader>Connect Ethereum Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text> Confirm Address </Text>
            <Text> {connectedAddress} </Text>
            <Button onClick={handleClickaddEthAddress}> Add Address </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }





  useEffect(() => {
    if (user && user.posting_json_metadata) {
      try {
        const metadata = JSON.parse(user.posting_json_metadata);

        setName(name => name || metadata.profile.name || '');
        setAbout(about => about || metadata.profile.about || '');
        setAvatarUrl(avatarUrl => avatarUrl || metadata.profile.profile_image || '');
        setCoverImageUrl(coverImageUrl => coverImageUrl || metadata.profile.cover_image || '');
        setWebsite(website => website || metadata.profile.website || '');
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
                json_metadata: JSON.stringify({
                  profile: {
                    name: name,
                    about: about,
                    cover_image: coverImageUrl,
                    profile_image: avatarUrl,
                    website: website,
                  },
                  extensions: {
                    //add ethAddress to json_metadata
                    eth_address: ethAddress,
                  },
                }),
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


      const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);

    } catch (error) {
      console.error(error);
    }
  };


  const uploadFileToIPFS = async (file: File) => {
    try {
      if (file.type.startsWith("video/mp4")) {
        alert("Video file upload is not supported yet.");
      } else if (file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("file", file);
        formData.set("Content-Type", "multipart/form-data");

        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              "pinata_api_key": PINATA_API_KEY,
              "pinata_secret_api_key": PINATA_API_SECRET,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;
          console.log(ipfsUrl);
          return ipfsUrl;
        } else {
          const errorData = await response.json();
          console.error("Error uploading image file to Pinata IPFS:", errorData);
        }
      } else {
        alert("Invalid file type. Only images are allowed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleProfileFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfileFile(file);
      uploadFileToIPFS(file).then((ipfsUrl) => setAvatarUrl(ipfsUrl?.toString() || ''));
    }
  };

  const handleCoverFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      uploadFileToIPFS(file).then((ipfsUrl) => setCoverImageUrl(ipfsUrl?.toString() || ''));
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
              min-height: 150px;
            `}
          />
          <Text> Avatar URL</Text>
          <HStack>
            <Input
              placeholder="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <Button color={"limegreen"} border={"1px dashed limegreen"} variant="ghost" mt={2} mb={2}>
              <label htmlFor="profileFileInput">
                <FaUpload />
              </label>
              <input
                type="file"
                id="profileFileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfileFileInputChange}
              />
            </Button>
            {selectedProfileFile && (
              <div>
                {selectedProfileFile.name}
              </div>
            )}
          </HStack>
          <Text> Cover Image URL</Text>
          <HStack>

            <Input
              placeholder="Cover Image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
            <Button color={"limegreen"} border={"1px dashed limegreen"} variant="ghost" mt={2} mb={2}>
              <label htmlFor="coverFileInput">
                <FaUpload />
              </label>
              <input
                type="file"
                id="coverFileInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverFileInputChange}
              />
            </Button>
          </HStack>
          {selectedCoverFile && (
            <div>
              {selectedCoverFile.name}
            </div>
          )}
          <Text> Website</Text>
          <Input
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

        </ModalBody>
        <Flex align="center" justify="center" direction="column">
          <Button onClick={() => setIsEthSetupModalOpen(true)}> Add Ethereum Wallet Address </Button>
          <Text> {ethAddress} </Text>
        </Flex>
        <ModalFooter>
          <EthSetupModal />
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