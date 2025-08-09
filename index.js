const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/lookup", async (req, res) => {
  try {
    const { username, type } = req.body;
    if (!username || !type) {
      return res.status(400).json({ error: "Missing username or type" });
    }

    // Step 1: Get userId from username
    const userIdResponse = await axios.get(
      `https://users.roblox.com/v1/usernames/users`,
      { params: { usernames: JSON.stringify([username]) } }
    );

    if (!userIdResponse.data.data || userIdResponse.data.data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userIdResponse.data.data[0].id;

    let apiUrl;
    if (type === "friends") {
      apiUrl = `https://friends.roblox.com/v1/users/${userId}/friends`;
    } else if (type === "followers") {
      apiUrl = `https://friends.roblox.com/v1/users/${userId}/followers`;
    } else if (type === "followings") {
      apiUrl = `https://friends.roblox.com/v1/users/${userId}/followings`;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    // Step 2: Fetch data
    const response = await axios.get(apiUrl);

    // Extract usernames
    const usernames = response.data.data.map((item) => item.name);

    res.json({
      username,
      type,
      total: usernames.length,
      list: usernames
    });

  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on port ${PORT}`);
});