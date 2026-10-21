
import "dotenv/config";
import { sendEmail } from "./services/emailService.js";

const success = await sendEmail({
  to: process.env.EMAIL_USER,
  subject: "FoodTaxi Email Test",
  text: "Hello! Your FoodTaxi email notification setup is working.",
});

if (success) {
  console.log("Test completed successfully.");
} else {
  console.log("Test failed. Check the error above.");
}

process.exit(success ? 0 : 1);
