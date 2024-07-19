import chalk from "chalk";
import readline from "readline";
import { showLoadingSpinner, stopLoadingSpinner } from "../util/loader";
import { BerryCore } from "../berrycore";
import { BerryRunner } from "../util/runner";
import { RUNNER_EVENT } from "../../enum/runner.event";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const optionsList = [
  "Exit",
  "Parse File and convert to Obj",
  "Run test suite ",
  "Option 3",
];

function terminateProgram() {
  console.log(chalk.red("Terminating program..."));
  rl.close();
  process.exit(0);
}

function displayOptions() {
  console.log(chalk.blue("Please select an option:"));
  optionsList.forEach((option, index) => {
    console.log(chalk.green(`${index}`), chalk.white(`: ${option}`));
  });
}

async function handleChoice(choice: number) {
  if (choice === 0) {
    terminateProgram();
  } else if (choice > 0 && choice < optionsList.length) {
    console.log(chalk.blackBright(`You selected: ${optionsList[choice]}`));

    if (choice == 1) await parseFile();
    if (choice == 2) await runRunner();
    askQuestion();
  } else {
    console.log(chalk.red("Invalid option, try again."));
    askQuestion();
  }
}

function askQuestion() {
  displayOptions();
  rl.question(
    chalk.blue("Enter your choice (number): "),
    async (input: string) => {
      const choice = parseInt(input);
      await handleChoice(choice);
    }
  );
}

export function handleInput(options: any) {
  if (options.input) {
    askQuestion();
  }
}

async function runRunner() {
  const eventManager = new BerryRunner();

  const berryCore = new BerryCore();
  let result = await berryCore.parseAndValidateInput(
    "/Users/rinturajc/lib_projects/Flexiberry/berrycore/src/_fake_data/d2.yaml"
  );

  // Subscribe to 'myEvent' event
  eventManager
    .on(RUNNER_EVENT.START, async (data: any) => {
      console.log("Event START:", data);
    })
    .on(RUNNER_EVENT.ERROR, async (data: any) => {
      console.log("Test ERROR:", data);
    });
  // .on(RUNNER_EVENT.COMPLETED, async (data: any) => {
  //   console.log("Test COMPLETED:", data);
  // });

  await eventManager.run(result, "development");
}

async function parseFile(): Promise<any> {
  return new Promise((resolve, reject) => {
    rl.question(
      chalk.blue("Please enter the input file path or type 'exit' to quit: "),
      async (input: string) => {
        if (input.toLowerCase() === "exit") {
          terminateProgram();
          resolve(null);
        } else {
          try {
            showLoadingSpinner();
            const berryCore = new BerryCore();
            let result = await berryCore.parseAndValidateInput(input);
            console.log(chalk.green("Converted: "), chalk.yellow(result));
            stopLoadingSpinner();
            resolve(result);
          } catch (error) {
            console.error(chalk.red("Error processing file: "), error);
            reject(error);
          }
        }
      }
    );
  });
}
