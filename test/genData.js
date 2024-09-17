const fs = require("fs");

// Define possible addresses
const addresses = [
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
];

// Define possible name badges
const badgeNames = [
    "ARC Crew",
    "Connector",
    "Champion",
    "Connoisseur",
    "Co-creator",
    "Champion+",
    "Connector+",
    "Connoisseur+",
    "Co-creator+",
];

const getRandomPoint = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 45 JSON objects, ensuring each address has all name badges
const jsonArray = addresses.flatMap((address) =>
    badgeNames.map((badge) => ({
        to: address,
        point: getRandomPoint(20, 200),
        badgeName: badge,
    })),
);

// Convert the array to a JSON string
const jsonOutput = JSON.stringify(jsonArray, null, 4);

// Optionally write to a file
fs.writeFileSync("test/pointDemoes.json", jsonOutput, "utf8");

console.log(
    "JSON data with 45 elements generated and saved to pointDemoes.json",
);
