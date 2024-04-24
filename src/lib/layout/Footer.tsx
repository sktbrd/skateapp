import { Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex
      as="footer"
      width="full"
      align="center"
      alignSelf="flex-end"
      justifyContent="center"
      margin={"20px"}
    >

      <Text fontSize="xs">
        <Link href="https://skatehive.app" isExternal>
          Skatehive.app
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
