import React, { useState } from 'react';
import { Button, useStyleConfig, ChakraProvider } from '@chakra-ui/react';
import WidgetBot from '@widgetbot/react-embed';

const ChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const chatButtonStyles = useStyleConfig('Button', { variant: 'chatButton' });

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1 }}>
      <Button onClick={toggleChat} variant="chatButton">
<img
  src="https://gifdb.com/images/high/pepe-frog-meme-reading-text-nervous-sweat-3m7pw9rg9d3fyf5f.gif"
  width="100px"
  height="100px"
  style={{ borderRadius: '50%' }}
  alt="Pepe Frog"
/>

        
      </Button>
      {isOpen && (
        <WidgetBot
          server="631777256234156033"
          channel="943559879082246194"
          width="800"
          height="600"
          style={{ zIndex: '2'}}
        />
      )}
    </div>
  );
};

const theme = {
  styles: {
    global: {
      // Add global styles here
    },
  },
  components: {
    Button: {
      chatButton: {
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '20px',
        cursor: 'pointer',
        outline: 'none',
        _hover: {
          backgroundColor: '#0056b3',
        },
      },
    },
        WidgetBot: {
      chatWidget: {
        width: '400px', // Set the width to your desired size
        height: '500px', // Set the height to your desired size
      },
    },
  },
};

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <div>
        <ChatButton />
        
      </div>
    </ChakraProvider>
  );
};

export default App;
