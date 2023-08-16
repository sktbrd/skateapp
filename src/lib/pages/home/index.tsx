import { Flex } from "@chakra-ui/react";
import HiveBlog from "./components/Feed";


const Home = () => {


  return (
    <Flex direction="column" alignItems="center" justifyContent="center" >
      <HiveBlog /> {/* Including the HiveBlog component */}
    </Flex>
  );
};


export default Home;

