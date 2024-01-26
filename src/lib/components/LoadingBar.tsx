import { Image } from "@chakra-ui/react";
import { LoadingContext } from "lib/pages/utils/LoadingProvider";
import { useContext } from "react";

const randomSentences = [
  // "Have a spooky Skateboarding!",
  "Don't mall grab, or do it, you do you...",
  "'Ok to push Mongo, it is! -master yoda'",
  "Roll one, and play some stoken.quest?",
  "Remember Mirc times ?",
  "Fuck instagram!",
  "Ready to grind on chain?",
  "Praise whoever made skatevideosite",
  "Loading Stokenomics...",
  "Initiating Proof of Stoke...",
  "We will load as fast as Daryl Rolls",
  "Who was Gnartoshi Shredamoto?",
  "We have secret sections here, can you find?",
];

export const LoadingBar = () => {
  const { isLoadingInitial, setIsLoadingInitial } = useContext(LoadingContext);
  const randomIndex = Math.floor(Math.random() * randomSentences.length);
  const randomSentence = randomSentences[randomIndex];

  return (
    <center style={{ display: isLoadingInitial ? "block" : "none" }}>
      <Image
        borderRadius={"20px"}
        boxSize="100%"
        src="/assets/pepenation.gif"
      />
      {/* <Text>{randomSentence}</Text> */}
    </center>
  );
};
