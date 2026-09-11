const app = require("./src/app");
const connectDB = require("./src/config/database");
require("./src/config/redis")

connectDB()

app.listen(3000, () => {
    console.log("server is running on PORT 3000")
})