import { injectable } from 'tsyringe';
import * as winston from 'winston';

@injectable()
export class Logger
{
    error(message: string) {
        this.instance.error(message);
    }
    debug(message: string) {
        this.instance.debug(message);
    }
    warn(message: string) {
        this.instance.warn(message);
    }
    info(message: string) {
        this.instance.info(message);
    }
    private instance: winston.Logger;

    constructor()
    {
        this.instance = winston.createLogger({
            level: 'debug', // Default logging level
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                //winston.format.json(),
                winston.format.printf(({ level, message, timestamp }) => {
                    return `${timestamp}; ${level}; ${message}`;
                })
            ),
            transports: [
                // Console transport
                new winston.transports.Console({
                    format: winston.format.combine(
    
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                // File transport (you can configure file path and other options)
                new winston.transports.File({ filename: 'app.log' })
            ]
        });
    }
}

