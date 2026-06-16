const TIME_MAX_GC = 1000 * 60 * 60 * 24;

function delayed(timeout: number) {
  return new Promise<boolean | undefined>((resolve) => {
    setTimeout(() => {
      resolve(true); // Set value to true after timeout
    }, timeout);
  });
}

export async function delayedBoolean(timeout: number) {
  const delayedResult: boolean | undefined  = await delayed(timeout); // Set timeout to 2 seconds

  return delayedResult;
}

export { TIME_MAX_GC };
