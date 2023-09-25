import {
  Box,
  Button,
  Grid,
  Heading,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => navigate("/");

  return (
    <Grid gap={4} textAlign="center">
      <Heading> 404 !</Heading>
      <Heading>You found nothing !</Heading>

      <Box maxWidth={[280, 400]} marginX="auto">
        <Image border="1px solid limegreen" borderRadius="10px" width={400} src="/assets/404.gif" />

      </Box>

      <Box>
        <Text>It&apos;s Okay!</Text>
        <Button onClick={handleBackToHome}>Let&apos;s Head Back</Button>
      </Box>
    </Grid>
  );
};

export default Page404;
