// import { UI } from "./ui.js";

// // Example test data
// export function runDemo() {
//   const testCases: any[] = [
//     {
//       id: "case1",
//       name: "Login API",
//       steps: [
//         { name: "Send request", status: "pending", timeElapsed: 0 },
//         { name: "Check response", status: "pending", timeElapsed: 0 },
//       ],
//     },
//     {
//       id: "case2",
//       name: "User Profile API",
//       steps: [
//         { name: "Send request", status: "pending", timeElapsed: 0 },
//         { name: "Validate schema", status: "pending", timeElapsed: 0 },
//         { name: "Check DB", status: "pending", timeElapsed: 0 },
//         { name: "Check dd", status: "failed", timeElapsed: 0 },
//       ],
//     },
//   ];

//   const ui = new UI();
//   ui.printJobDetails();

//   ui.initializeTable(testCases);
//   // Spinner animation: refresh the table every 1 second
//   const spinnerInterval = setInterval(() => {
//     ui.render();
//   }, 100);

//   setTimeout(() => {
//     ui.updateTestStep("case1", 0, "running", 50);
//     // ui.log("Request sent to /api/login", "info");
//   }, 500);
//   setTimeout(() => {
//     ui.updateTestStep("case1", 0, "passed", 120);
//     ui.updateTestStep("case1", 1, "passed", 10);
//     // ui.log("User Profile API > Send request failed: 401 Unauthorized", "error");
//     // ui.log("Retrying request...", "info");
//   }, 1500);
//   setTimeout(() => {
//     ui.updateTestStep("case2", 1, "passed", 44);
//     ui.updateTestStep("case2", 2, "passed", 55);
//     ui.updateTestStep("case2", 0, "passed", 30);
//   }, 2500);
//   setTimeout(() => {
//     ui.updateTestStep("case2", 3, "passed", 80);
//     ui.updateTestStep("case2", 1, "passed", 0);
//     // ui.log("Retrying request...", "info");
//   }, 3500);
//   // After all updates, exit after a short delay
//   setTimeout(() => {
//     clearInterval(spinnerInterval);
//     ui.exit();
//     // ui.printTestDetails({
//     //   title: "My First Test",
//     //   version: "0.1.0",
//     //   startTime: "2023-02-15 15:39:44.313Z",
//     //   endTime: "2023-02-15 15:39:44.313Z",
//     //   duration: "120ms",
//     //   status: "Pending",
//     //   apiCount: 9,
//     //   flexiberry: "1.0.0",
//     //   stepCounts: { passed: 6, failed: 2, pending: 2 },
//     // });
//   }, 4000);
// }
