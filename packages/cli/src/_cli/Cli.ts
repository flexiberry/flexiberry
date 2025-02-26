import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import chalk from "chalk";

export class Cli {
  public static main(version: string): void {
    console.log("Hello, World!");
    this.banner(version);
  }

  private static banner(version: string) {
    const text =
      "\n\n" +
      figlet.textSync("FlexiBerry", {
        horizontalLayout: "universal smushing",
        whitespaceBreak: true,
        font: "Big Money-sw",
        showHardBlanks: true,
      });

    const rainbow = chalkAnimation.rainbow(text);
    rainbow.render(); // Animation starts
    console.log(chalk.gray("Version: ") + chalk.green(version));
    console.log("Welcome to", chalk.bgBlue(" FlexiBerry CLI! "));
    console.log("\n");
    setTimeout(() => {
      rainbow.stop(); // Stop the animation after a delay
    }, 1000);
  }
}
