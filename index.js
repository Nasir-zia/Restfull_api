const express = require('express');
const users = require("./MOCK_DATA.json");
const fs = require("fs");

const app = express();
const PORT = 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/', (req, res) => {
    const html = `
        <h1>Users</h1>
        <ul>
            ${users.map(user => `<li>${user.first_name} ${user.last_name}</li>`).join('')}
        </ul>
    `;
    res.send(html);
});

app.route("/api/users/:id")
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find(user => user.id === id);
        return user ? res.json(user) : res.status(404).json({ message: "User not found" });
    });

app.delete("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }
    
    users.splice(userIndex, 1);
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting user" });
        }
        res.json({ message: "User deleted successfully" });
    });
});

app.post("/api/users", (req, res) => {
    const body = req.body;
    const newUser = { ...body, id: users.length + 1 };
    users.push(newUser);
    
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ message: "An error occurred" });
        }
        res.json({ message: "User added successfully", user: newUser });
    });
});

app.patch("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }
    
    users[userIndex] = { ...users[userIndex], ...req.body };
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating user" });
        }
        res.json({ message: "User updated successfully", user: users[userIndex] });
    });
});

app.put("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    // Ensure request body contains valid user data
    const { first_name, last_name, email, Title, gender } = req.body;

    if (!first_name || !last_name || !email || !Title || !gender) {
        return res.status(400).json({ message: "All fields are required" });
    }

    users[userIndex] = { id, first_name, last_name, email, Title, gender };

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating user" });
        }
        res.json({ message: "User updated successfully", user: users[userIndex] });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
