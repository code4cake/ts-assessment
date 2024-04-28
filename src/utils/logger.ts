type LogType = 'log' | 'info' | 'warn' | 'error';

class Logger {
  private isLoggingEnabled = true;

  public enableLogging(): void {
    this.isLoggingEnabled = true;
  }

  public disableLogging(): void {
    this.isLoggingEnabled = false;
  }

  private log(type: LogType, message: string, ...optionalParams: unknown[]): void {
    if (this.isLoggingEnabled) {
      console[type](message, ...optionalParams);
    }
  }

  public info(message: string, ...optionalParams: unknown[]): void {
    this.log('info', message, ...optionalParams);
  }

  public warn(message: string, ...optionalParams: unknown[]): void {
    this.log('warn', message, ...optionalParams);
  }

  public error(message: string, ...optionalParams: unknown[]): void {
    this.log('error', message, ...optionalParams);
  }
}

export const logger = new Logger();
