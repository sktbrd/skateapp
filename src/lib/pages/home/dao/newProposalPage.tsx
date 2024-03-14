// path: src/lib/pages/home/dao/newProposalPage.tsx 

import React, { useEffect, useState } from 'react';
import MDEditor, { commands } from "@uiw/react-md-editor";

// Chakra UI
import { Input, Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Text, Flex, Image, useBreakpointValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { get, set } from 'lodash';
//@ts-ignore
import { usePioneer } from '@pioneer-platform/pioneer-react';


interface CurrentEvent {
    end: string;
    start: string;
    title: string;
}

interface Guildxyz {
    id: number;
    roles: number[];
}

interface TransactorAddress {
    type: string;
    network: string;
    address: string;
}

interface Skatehive {
    name: string;
    displayName: string;
    currentCycle: number;
    currentEvent: CurrentEvent;
    cycleStartDate: string;
    dolthubLink: string;
    guildxyz: Guildxyz;
    juiceboxProjectId: number;
    nextProposalId: number;
    snapshotSpace: string;
    spaceOwners: any[]; // Replace any with a more specific type if possible
    transactorAddress: TransactorAddress;
}


interface ProposalInfoResponse {
    success: boolean;
    data: {
        proposalInfo: {
            snapshotSpace: string;
            proposalIdPrefix: string;
            minTokenPassingAmount: number;
        },
        proposals: any[]; // Replace `any` with a more specific type if needed
        hasMore: boolean;
    }
}


const NewProposalPage = () => {
    const [body, setBody] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [ipfsUrl, setIpfsUrl] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentCycle, setCurrentCycle] = useState<number>(0);
    const [proposalIdPrefix, setProposalIdPrefix] = useState<string>('');
    const [nextProposalId, setNextProposalId] = useState<number>(0);
    const [ETHaddress, setETHAddress] = useState<string>('');
    const { state } = usePioneer();
    const { app, status, pubkeyContext } = state;

    const onStart = async function () {
        try {
            if (app && app.wallets && app.wallets.length > 0 && app.wallets[0].wallet && app.wallets[0].wallet.accounts) {
                const currentAddress = app.wallets[0].wallet.accounts[0];
                setETHAddress(currentAddress);
            } else {
                console.error('Some properties are undefined or null');
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        onStart();
    }, [app, status, pubkeyContext]);

    const getSpaceDetails = async () => {
        // https://api.nance.app/skatehive
        const response = await fetch('https://api.nance.app/skatehive');
        const data = await response.json();
        console.log(data.data);
        console.log("Current Cycle: ", currentCycle);
        setCurrentCycle(data.data.currentCycle);
    }

    const getProposalInformation = async () => {
        try {
            const response = await fetch('https://api.nance.app/skatehive/proposals');
            const data: ProposalInfoResponse = await response.json();
            if (data.success) {
                // Assuming you maintain a counter or logic to determine the next proposal ID
                const proposalCount = data.data.proposals.length + 1; // This is a placeholder logic
                setProposalIdPrefix(data.data.proposalInfo.proposalIdPrefix);
                setNextProposalId(proposalCount);
            } else {
                console.error('Failed to fetch proposal information');
            }
        } catch (error) {
            console.error('Error fetching proposal information:', error);
        }
    };


    useEffect(() => {
        getSpaceDetails();
        getProposalInformation();
    }, []);

    const createProposal = async () => {
        const proposalId = `${proposalIdPrefix}${nextProposalId}`; // Constructing the proposal ID
        const proposalData = {
            hash: "your_hash_here", // You need to generate or get this value as required
            title: title,
            body: body,
            governanceCycle: currentCycle,
            date: new Date().toISOString(),
            status: "Draft", // Example value, adjust as needed
            proposalId: proposalId,
            author: ETHaddress, // Adjust as needed
            coauthors: [],
            discussionThreadURL: "", // Adjust as needed
            ipfsURL: ipfsUrl,
            voteURL: "", // Adjust as needed
            voteSetup: { // Adjust as needed
                type: "",
                choices: ["for", "against", "abstain"],
            },
            // Add other fields as necessary
        };

        try {
            console.log("Proposal data:", proposalData);
            // const response = await fetch('/skatehive/proposals', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(proposalData),
            // });

            // const data = await response.json();
            // if (data.success) {
            //     // Handle successful proposal creation
            //     alert("Proposal created successfully!");
            // } else {
            //     // Handle errors or unsuccessful creation
            //     alert(data.error);
            // }
        } catch (error) {
            console.error("Error creating proposal:", error);
            alert("An error occurred while creating the proposal.");
        }
    };


    return (
        <Box m={5}>
            <Text fontSize="xl" fontWeight="bold">UNDER DEVELOPMENT</Text>
            <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Proposal Title"
                marginBottom={3}
            />
            <MDEditor
                value={body}
                onChange={(value, event, state) => setBody(value || "")}
                height={useBreakpointValue({ base: "200px", md: "400px" })}
                commands={[
                    commands.bold,
                    commands.italic,
                    commands.hr,
                    commands.divider,
                    commands.link,
                    commands.quote,
                    commands.code,
                    commands.image,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.checkedListCommand,
                    commands.codeEdit,
                    commands.codeLive,
                    commands.codePreview,

                ]}
            />
            <Button onClick={() => setIsModalOpen(true)}>Preview</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Preview</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box>
                            <Text fontSize="xl" fontWeight="bold">{title}</Text>
                            <Text fontSize="sm" color="gray.500">by {ETHaddress}</Text>
                            <Text fontSize="sm" color="gray.500">Posted on {new Date().toISOString()}</Text>
                            <Image src={ipfsUrl} />
                            <ReactMarkdown>{body}</ReactMarkdown>
                            <Button onClick={createProposal}>Create Proposal</Button>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={() => setIsModalOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default NewProposalPage;