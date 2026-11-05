const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter admin username: ", (username) => {
  rl.question("Enter admin password: ", async (password) => {
    try {
      if (!username.trim() || password.length < 8) {
        console.log("Username is required and password must be at least 8 characters.");
      } else {
        const hash = await bcrypt.hash(password, 12);

        console.log("\nUse this SQL in MySQL:");
        console.log(
          `INSERT INTO users (Username, Password_Hash, Role) VALUES ('${username.trim().replace(/'/g, "''")}', '${hash}', 'admin');`
        );
      }
    } catch (error) {
      console.error("Error generating password hash:", error);
    } finally {
      rl.close();
    }
  });
});