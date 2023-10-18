import React, { useState, useEffect } from 'react';
import { Box, Grid, Image, Button } from '@chakra-ui/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Define the ImageItem interface
interface ImageItem {
  id: string;
  src: string;
}

// Define the CaptchaProps type
interface CaptchaProps {
  onCaptchaCompletion: (completed: boolean) => void;
}

// Define the array of images
const images: ImageItem[] = [
  { id: '1', src: 'https://www.skatehype.com/f/shL.png' },
  { id: '2', src: 'https://www.skatehype.com/f/shR.png' },
  { id: '3', src: 'https://www.skatehype.com/f/shrL.png' },
  { id: '4', src: 'https://www.skatehype.com/f/shrR.png' },
];

// Define an array of trick names
const trickNames: string[] = [
  'Nollie Flip',
  '360 Flip',
  'Varial Heelflip',
  'Nollie Heelflip',
  'Nollie 360flip'
];

// Define correct answers for each trick
const trickCorrectAnswers: Record<string, Record<string, string[]>> = {
  'Nollie Flip': {
    'A6': ['2'],
    'B3': ['1'],
  },
  '360 Flip': {
    'B4': ['4'],
    'A1': ['1'],
  },
  'Varial Heelflip': {
    'A4': ['2'],
    'B1': ['1'],
  },
  'Nollie Heelflip': {
    'B6': ['2'],
    'A3': ['1'],
  },
  'Nollie 360flip': {
    'A6': ['2'],
    'B3': ['3'],
  },
};

// Function to get a random trick name
const getRandomTrickName = () => {
  const randomIndex = Math.floor(Math.random() * trickNames.length);
  return trickNames[randomIndex];
};

// Define the Captcha component
const Captcha: React.FC<CaptchaProps> = ({ onCaptchaCompletion }) => {
  // State for user's selected image positions
  const [userImagePositions, setUserImagePositions] = useState<Record<string, ImageItem | null>>({
    'A1': null,
    'A2': null,
    'A3': null,
    'A4': null,
    'A5': null,
    'A6': null,
    'A7': null,
    'B1': null,
    'B2': null,
    'B3': null,
    'B4': null,
    'B5': null,
    'B6': null,
    'B7': null,
  });

  // State for user's answers
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  // State for the current random trick name
  const [randomTrickName, setRandomTrickName] = useState<string>('');

  // State for the number of occupied positions
  const [occupiedPositions, setOccupiedPositions] = useState<number>(0);

  // URL for the background image
  const backgroundImageURL = 'https://i.ibb.co/S5DR5qv/image.png';

  // State to track if the captcha is passed
  const [captchaPassed, setCaptchaPassed] = useState<boolean | null>(null);

  // Initialize a random trick name on component mount
  useEffect(() => {
    setRandomTrickName(getRandomTrickName());
  }, []);

  // Handle dropping an image into a grid position
  const handleDrop = (imageId: string, position: string) => {
    const image = images.find((img) => img.id === imageId);

    const updatedImagePositions = { ...userImagePositions, [position]: image || null };

    setUserImagePositions(updatedImagePositions);
    setUserAnswers([...userAnswers, `User's Choice for ${position}: ${imageId}`]);

    if (image) {
      setOccupiedPositions((prevOccupiedPositions) => prevOccupiedPositions + 1);
    }
  };

  // Reset the captcha to its initial state
  const resetCaptcha = () => {
    setUserImagePositions({
      'A1': null,
      'A2': null,
      'A3': null,
      'A4': null,
      'A5': null,
      'A6': null,
      'A7': null,
      'B1': null,
      'B2': null,
      'B3': null,
      'B4': null,
      'B5': null,
      'B6': null,
      'B7': null,
    });
    setUserAnswers([]);
    setOccupiedPositions(0);
    setRandomTrickName(getRandomTrickName());
    setCaptchaPassed(null);
  };

  // Check if the user's answers are correct
  const checkAnswers = () => {
    const isCorrect = isAnswerCorrect(randomTrickName);
    if (isCorrect) {
      setCaptchaPassed(true);
  
      // Pass the completion status to the parent component
      onCaptchaCompletion(true);
    } else {
      setCaptchaPassed(false);
    }
  };
  

  // Check if the user's answers for a given trick are correct
  const isAnswerCorrect = (trick: string) => {
    const correctAnswers = trickCorrectAnswers[trick];

    if (!correctAnswers) return true;

    for (const position in correctAnswers) {
      if (correctAnswers.hasOwnProperty(position)) {
        const image = userImagePositions[position];
        if (!image || !correctAnswers[position].includes(image.id)) {
          return false;
        }
      }
    }

    return true;
  };

  // Render the grid of image positions
  const renderGrid = () => {
    const grid: JSX.Element[] = [];
    const rows = ['A', 'B'];
    const cols = ['1', '2', '3', '4', '5', '6'];

    rows.forEach((row) => {
      cols.forEach((col) => {
        const position = `${row}${col}`;
        const image = userImagePositions[position];

        grid.push(
          <GridItem key={position} position={position} image={image} onDrop={handleDrop} />
        );
      });
    });

    return grid;
  };

  return (
    <Box>
        <center>
        <img src="https://i.ibb.co/6ZqHYdK/image.png" ></img>
        </center>
      
      <h1> Pepe wants to learn {randomTrickName}, he is goofy</h1>
        <h1> proove that you're cool helping Pepe to land it by</h1>
      <h1> placing his foot in the right position for {randomTrickName}</h1>
      <Grid
        templateColumns="repeat(6, 1fr)"
        gap={2}
        style={{ backgroundImage: `url(${backgroundImageURL})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}
      >
        {renderGrid()}
      </Grid>
      <div style={{ marginTop:'30px', display: 'flex', flexWrap: 'wrap' }}>
        {images.map((image) => (
          <DraggableImage  key={image.id} {...image} />
        ))}
      </div>
      <center>

      {occupiedPositions >= 2 && (
        <Button onClick={resetCaptcha}>Reset</Button>
      )}
      {captchaPassed === null && (
        <Button onClick={checkAnswers}>Check Answer</Button>

      )}
              </center>

      {captchaPassed !== null && captchaPassed === true && (
        // Render the form only if the captcha is passed
        <div>
          <form >
            <label htmlFor="email">Enter Your Email:</label>
            <input type="email" id="email" name="email" placeholder="Your email" />
            <button type="submit">Sign Up</button>
          </form>
        </div>
      )}
      {captchaPassed !== null && (
        <div>
          {captchaPassed
            ? 'Captcha Passed! You have successfully completed the captcha.'
            : 'Captcha Failed! Please try again.'}
        </div>
      )}
      {/* ... (your user answers and result components) */}
    </Box>
  );
};

// Define the DroppedImage component
const DroppedImage: React.FC<ImageItem> = ({ id, src }) => {
  return (
    <Box
      w="160px"
      h="160px"
      position="relative"
      overflow="hidden"
    >
      <Image
        src={src}
        alt={`Image ${id}`}
        w="auto"
        h="120px"
        marginTop="40px"
      />
    </Box>
  );
};

// Define the GridItemProps interface
interface GridItemProps {
  position: string;
  image: ImageItem | null;
  onDrop: (imageId: string, position: string) => void;
}

// Define the GridItem component
const GridItem: React.FC<GridItemProps> = ({ position, image, onDrop }) => {
  const typedImage = image as ImageItem | null;

  const [, ref] = useDrop({
    accept: 'IMAGE',
    drop: (item: ImageItem) => {
      onDrop(item.id, position);
    },
  });

  return (
    <Box
      ref={ref}
      p={2}
      h="80px"
      w="80px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    //   border="1px solid limegreen"
    >
      {typedImage ? (
        <DroppedImage id={typedImage.id} src={typedImage.src} />
      ) : null}
    </Box>
  );
};

// Define the DraggableImage component
const DraggableImage: React.FC<ImageItem> = ({ id, src }) => {
  const [, ref] = useDrag({
    type: 'IMAGE',
    item: { id, src },
  });

  return (
    <Box
      ref={ref}
      cursor="pointer"
      w="80px"
      h="80px"
      marginTop="50px"
    >
      <Image
        src={src}
        alt={`Image ${id}`}
        w="80px"
        h="80px"
      />
    </Box>
  );
};

// Define the UserAnswersProps interface
interface UserAnswersProps {
  userAnswers: string[];
}

// Define the UserAnswers component
const UserAnswers: React.FC<UserAnswersProps> = ({ userAnswers }) => {
  return (
    <Box mt={4}>
      <strong>User's Answers:</strong>
      <ul>
        {userAnswers.map((answer, index) => (
          <li key={index}>{answer}</li>
        ))}
      </ul>
    </Box>
  );
};

// Define the ResultProps interface
interface ResultProps {
  userImagePositions: Record<string, ImageItem | null>;
  isAnswerCorrect: boolean;
  randomTrickName: string;
}

// Define the Result component
const Result: React.FC<ResultProps> = ({ userImagePositions, isAnswerCorrect, randomTrickName }) => {
  const results: JSX.Element[] = [];

  for (const position in userImagePositions) {
    if (userImagePositions.hasOwnProperty(position)) {
      const isPositionCorrect = isAnswerCorrect && userImagePositions[position] ? trickCorrectAnswers[randomTrickName][position].includes(userImagePositions[position]!.id) : false;

      results.push(
        <div key={position}>
          {position}: {isPositionCorrect ? 'Correct' : 'Incorrect'}
        </div>
      );
    }
  }

  return (
    <Box mt={4}>
      <strong>Results:</strong>
      {results}
    </Box>
  );
};

// Define the CaptchaPage component
const CaptchaPage: React.FC<{ onCaptchaCompletion: (completed: boolean) => void }> = ({ onCaptchaCompletion }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Captcha onCaptchaCompletion={onCaptchaCompletion} />
    </DndProvider>
  );
};

export default CaptchaPage;
