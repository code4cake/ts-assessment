import { expect } from 'chai';
import sinon, { type SinonSpy } from 'sinon';

import { logger } from './logger';

describe('Logger utility function', () => {
  let consoleInfoSpy: SinonSpy;
  let consoleWarnSpy: SinonSpy;
  let consoleErrorSpy: SinonSpy;

  beforeEach(() => {
    consoleInfoSpy = sinon.spy(console, 'info');
    consoleWarnSpy = sinon.spy(console, 'warn');
    consoleErrorSpy = sinon.spy(console, 'error');
  });

  afterEach(() => {
    consoleInfoSpy.restore();
    consoleWarnSpy.restore();
    consoleErrorSpy.restore();
  });

  it('should log messages of type info', () => {
    logger.enableLogging();
    logger.info('Test info message');
    expect(consoleInfoSpy.calledWith('Test info message')).to.be.true;
  });

  it('should log messages of type warn', () => {
    logger.enableLogging();
    logger.warn('Test warn message');
    expect(consoleWarnSpy.calledWith('Test warn message')).to.be.true;
  });

  it('should log messages of type error', () => {
    logger.enableLogging();
    logger.error('Test error message');
    expect(consoleErrorSpy.calledWith('Test error message')).to.be.true;
  });

  it('should not log messages when logging is disabled', () => {
    logger.disableLogging();
    logger.info('Test info message');
    logger.warn('Test warn message');
    logger.error('Test error message');
    expect(consoleInfoSpy.called).to.be.false;
    expect(consoleWarnSpy.called).to.be.false;
    expect(consoleErrorSpy.called).to.be.false;
  });

  it('should enable and disable logging correctly', () => {
    logger.disableLogging();
    logger.info('Test message');
    expect(consoleInfoSpy.called).to.be.false;

    logger.enableLogging();
    logger.info('Test message');
    expect(consoleInfoSpy.calledWith('Test message')).to.be.true;
  });
});
