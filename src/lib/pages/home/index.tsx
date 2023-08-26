import { Flex } from "@chakra-ui/react";
import HiveBlog from "./posts/Feed";
import HiveBlogHover from "./posts/Feed2";

const Home = () => {


  return (
    <Flex direction="column" alignItems="center" justifyContent="center" >
      <HiveBlog /> 
      <HiveBlogHover />
    </Flex>
  );
};


export default Home;

