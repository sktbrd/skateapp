export const setStore = (key: string, value: any) => {
  // load game storage (QuestForStoken.0.game.sav)
  let game = localStorage.getItem('QuestForStoken.0.game.sav');

  // if no game storage is provided
  if (!game) {
    // create game storage
    game = '[qfs]\n';
    game += `${key}="${value}"`;
  }

  // split game storage into lines
  const lines = game.split('\n');

  let found = false;

  // loop through lines
  for (let i = 0; i < lines.length; i++) {
    // if line contains key
    if (lines[i].includes(key)) {
      found = true;
      // replace line with new value
      lines[i] = `${key}="${value}"`;
      break;
    }
  }

    // if key is not found
  if (!found) {
    // add new line with key and value
    lines.push(`${key}="${value}"`);
  }

  // save game storage
  localStorage.setItem('QuestForStoken.0.game.sav', lines.join('\n'));
};

export const getStore = (key: string) => {
  // load game storage (QuestForStoken.0.game.sav)
  const game = localStorage.getItem('QuestForStoken.0.game.sav');

  // if no game storage is provided
  if (!game) {
    return false;
  }

  // split game storage into lines
  const lines = game.split('\n');

  // loop through lines
  for (let i = 0; i < lines.length; i++) {
    // if line contains key
    if (lines[i].includes(key)) {
      // return value
      let value = lines[i].split('=')[1];
      // remove quotes
      value = value.replace(/"/g, '');
      // remove carriage return
      value = value.replace(/\r/g, '');
      return value;
    }
  }

  return false;
}

export const removeStore = (key: string) => {
  // load game storage (QuestForStoken.0.game.sav)
  const game = localStorage.getItem('QuestForStoken.0.game.sav');

  if (game) {
    // split game storage into lines
    const lines = game.split('\n');

    // loop through lines
    for (let i = 0; i < lines.length; i++) {
      // if line contains key
      if (lines[i].includes(key)) {
        // remove line
        lines.splice(i, 1);
        break;
      }
    }

    // save game storage
    localStorage.setItem('QuestForStoken.0.game.sav', lines.join('\n'));
  }
};

export const getUpdate = () => {
  let update = getStore("Update");
  
  if (!update) {
    return false;
  }

  return parseInt(update) === 1 ? true : false;
};
