const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;  // Use dynamic port for Render

app.use(cors());
app.use(bodyParser.json());

app.post('/lookup', async (req, res) => {
  const { username, type } = req.body;

  if (!username || !type) {
    return res.status(400).json({ error: 'Missing username or type.' });
  }

  try {
    // Get userId from username
    const userRes = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      { usernames: [username], excludeBannedUsers: true },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const user = userRes.data.data[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = user.id;

    let listUrl;
    if (type === 'friends') {
      listUrl = `https://friends.roblox.com/v1/users/${userId}/friends`;
    } else if (type === 'followers') {
      listUrl = `https://friends.roblox.com/v1/users/${userId}/followers`;
    } else if (type === 'following') {
      listUrl = `https://friends.roblox.com/v1/users/${userId}/followings`;
    } else {
      return res.status(400).json({ error: 'Invalid type.' });
    }

    // Get list (max 100)
    const listRes = await axios.get(listUrl + '?limit=100');
    const users = listRes.data.data || [];

    const userNames = users.map(u => u.username);

    res.json({
      userId,
      username: user.name,
      displayName: user.displayName,
      list: userNames
    });

  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
