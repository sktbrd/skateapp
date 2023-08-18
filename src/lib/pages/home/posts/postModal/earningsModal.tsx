import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Avatar,
} from "@chakra-ui/react";

function repLog10(rep2: string) {
  if (rep2 == null) return rep2;
  let rep = String(rep2);
  const neg = rep.charAt(0) === "-";
  rep = neg ? rep.substring(1) : rep;

  let out = Math.log10(parseFloat(rep));
  if (isNaN(out)) out = 0;
  out = Math.max(out - 9, 0);
  out = (neg ? -1 : 1) * out;
  out = out * 9 + 25;
  out = parseInt(out.toFixed(0));
  return out;
}

interface EarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any; // Pass the selected post data here
}

const EarningsModal: React.FC<EarningsModalProps> = ({ isOpen, onClose, post }) => {
  const [voters, setVoters] = useState<any[]>([]);
  let totalContribution = 0;

  useEffect(() => {
    // Calculate the total payout value of the post
    const totalPayoutValue = parseFloat(post.pending_payout_value);

    // Extract voters' information from the active_votes array
    const votersData = post.active_votes.map((vote: any) => {
      const voterReputation = repLog10(vote.reputation);
      const voterVotingPower = parseFloat(vote.percent) / 10000;

      // Calculate voter's contribution based on reputation, voting power, and other factors
      const contribution = (voterReputation * voterVotingPower * totalPayoutValue) / 10000;
      totalContribution += contribution;

      return {
        voter: vote.voter,
        voting_power: (voterVotingPower * 100).toFixed(2) + "%",
        contribution: contribution.toFixed(3),
        reputation: voterReputation,
        avatar: `https://images.hive.blog/u/${vote.voter}/avatar/small`,
      };
    });

    // Sort the voters by descending contribution
    const sortedVoters = votersData.sort((a:any, b:any) => parseFloat(b.contribution) - parseFloat(a.contribution));
    
    setVoters(sortedVoters);
  }, [post]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent border="1px solid limegreen" backgroundColor="black">
        <ModalHeader>Voters and Tips</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Table variant="simple" colorScheme="teal" size="sm" overflowX="auto">
            <Thead>
              <Tr>
                <Th>Avatar</Th>
                <Th>Voter</Th>
                <Th>Voting Power</Th>
                <Th>Contribution</Th>
                <Th>Reputation</Th>
              </Tr>
            </Thead>
            <Tbody>
              {voters.map((voter, index) => (
                <Tr key={index}>
                  <Td>
                    <Avatar size="sm" name={voter.voter} src={voter.avatar} />
                  </Td>
                  <Td>{voter.voter}</Td>
                  <Td>{voter.voting_power}</Td>
                  <Td>{voter.contribution}</Td>
                  <Td>{voter.reputation.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Td colSpan={3}></Td>
                <Td>
                  <strong>Total Contribution:</strong>
                </Td>
                <Td>
                  <strong>{totalContribution.toFixed(3)}</strong>
                </Td>
              </Tr>
            </Tfoot>
          </Table>
          <Button
            colorScheme="teal"
            variant="outline"
            mt={4}
            leftIcon={<img style={{ width: "18px", height: "18px", marginBottom: "3px" }}
            src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" alt="Gift Icon" />} // Replace with actual icon
          >
            Follow Skatehive Curation Trail
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EarningsModal;
