import { execa } from 'execa';
import ora from 'ora';

export async function installDependencies(cwd: string, pm: 'npm' | 'yarn' | 'pnpm'): Promise<void> {
  const spinner = ora(`Installing dependencies with ${pm}...`).start();
  try {
    await execa(pm, ['install'], { cwd });
    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }
}

