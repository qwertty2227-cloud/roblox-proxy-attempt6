const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Change to GET with query params: /lookup?username=someuser&type=friends
app.get("/lookup", async (req, res) => {
  const username = req.query.username;
  const type = req.query.type;

  if (!username || !type) {
    return res.status(400).json({ error: "Missing username or type" });
  }

  const allowedTypes = ["friends", "followers", "followings"];
  if (!allowedTypes.includes(type.toLowerCase())) {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    // 1. Get user ID by username
    const userRes = await axios.get(
      `https://api.roblox.com/users/get-by-username?username=${encodeURIComponent(username)}`
    );

    if (!userRes.data || userRes.data.Id === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.data.Id;

    // 2. Fetch the requested list by userId and type
    let listRes;

    if (type === "friends") {
      listRes = await axios.get(
        `https://friends.roblox.com/v1/users/${userId}/friends`
      );
      const friendsUsernames = listRes.data.data.map((user) => user.name);
      return res.json({ list: friendsUsernames });
    }

    if (type === "followers") {
      listRes = await axios.get(
        `https://friends.roblox.com/v1/users/${userId}/followers`
      );
      const followersUsernames = listRes.data.data.map((user) => user.name);
      return res.json({ list: followersUsernames });
    }

    if (type === "followings") {
      listRes = await axios.get(
        `https://friends.roblox.com/v1/users/${userId}/followings`
      );
      const followingsUsernames = listRes.data.data.map((user) => user.name);
      return res.json({ list: followingsUsernames });
    }
  } catch (err) {
    console.error("Error fetching data:", err.message || err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
