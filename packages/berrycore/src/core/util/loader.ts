let loadingInterval: string | number | NodeJS.Timeout | undefined;

export function showLoadingSpinner() {
  const spinner = ["|", "/", "-", "\\"];
  let i = 0;
  loadingInterval = setInterval(() => {
    process.stdout.write(`\r${spinner[i]} Loading...`);
    i = (i + 1) % spinner.length;
  }, 200);
}

export function stopLoadingSpinner() {
  clearInterval(loadingInterval);
  process.stdout.write("\r"); // Clear the loading message
}
