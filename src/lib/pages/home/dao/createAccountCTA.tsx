import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, VStack, Image, HStack } from '@chakra-ui/react';
import axios from 'axios';

interface CommunityTotalPayout {
    totalHBDPayout: number;
}

const CreateAccountCTA: React.FC = () => {


    return (
        <center>
            <Box
                margin="0px"
                padding="5px"
                maxWidth="340px"
                borderRadius="md"
                boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
                background="linear-gradient(0deg, black, darkgreen, black)"
                color="white"
                border={"2px solid limegreen"}

            >



                <Flex justifyContent="center" flexDirection="column" alignItems="center">
                    <HStack>

                        {/* <Text fontSize="28px" marginBottom="5px">
            🗣
            </Text> */}
                        <Image src="assets/pepelove.png" boxSize="43px" marginBottom="5px" />

                        <a href='/accountcreation' target="_blank">
                            <Text color={"limegreen"} fontSize="12px" textShadow={"1px 1px 15px black"}> Click here to create an account for a friend </Text>
                        </a>
                    </HStack>

                </Flex>

            </Box>
        </center>
    );
};

export default CreateAccountCTA;
